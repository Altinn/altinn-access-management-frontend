import React, { useCallback, useRef, useState } from 'react';
import { Paragraph, Heading, Button, Dialog } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { PencilIcon, PlusIcon } from '@navikt/aksel-icons';
import { Snackbar, useSnackbar } from '@altinn/altinn-components';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import {
  useAssignCustomerMutation,
  useDeleteAgentSystemuserMutation,
  useRemoveCustomerMutation,
} from '@/rtk/features/systemUserApi';
import { PageContainer } from '@/features/amUI/common/PageContainer/PageContainer';
import { SystemUserPath } from '@/routes/paths';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';

import { SystemUserHeader } from '../components/SystemUserHeader/SystemUserHeader';
import type { AgentDelegation, AgentDelegationCustomer, SystemUser } from '../types';
import { DeleteSystemUserPopover } from '../components/DeleteSystemUserPopover/DeleteSystemUserPopover';
import { RightsList } from '../components/RightsList/RightsList';

import classes from './SystemUserAgentDelegationPage.module.css';
import { CustomerList } from './CustomerList';

const getAssignedCustomers = (
  customers: AgentDelegationCustomer[],
  existingAgentDelegations: AgentDelegation[],
): AgentDelegationCustomer[] => {
  const assignedCustomerIds = existingAgentDelegations.map((x) => x.customerId);
  return customers.filter((customer) => assignedCustomerIds.includes(customer.id));
};

interface SystemUserAgentDelegationPageContentProps {
  systemUser: SystemUser;
  customers: AgentDelegationCustomer[];
  existingAgentDelegations: AgentDelegation[];
}
export const SystemUserAgentDelegationPageContent = ({
  systemUser,
  customers,
  existingAgentDelegations,
}: SystemUserAgentDelegationPageContentProps): React.ReactNode => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const partyId = getCookie('AltinnPartyId');
  const partyUuid = getCookie('AltinnPartyUuid');

  const { id } = useParams();
  const modalRef = useRef<HTMLDialogElement>(null);

  const [delegations, setDelegations] = useState<AgentDelegation[]>(existingAgentDelegations);
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const [errorIds, setErrorIds] = useState<string[]>([]);
  const [assignedCustomers, setAssignedCustomers] = useState<AgentDelegationCustomer[]>(
    getAssignedCustomers(customers, existingAgentDelegations),
  );
  const { openSnackbar, dismissSnackbar } = useSnackbar();

  const { data: reporteeData } = useGetReporteeQuery();

  const [deleteAgentSystemUser, { isError: isDeleteError, isLoading: isDeletingSystemUser }] =
    useDeleteAgentSystemuserMutation();

  const handleDeleteSystemUser = (): void => {
    deleteAgentSystemUser({ partyId, systemUserId: id || '', partyUuid })
      .unwrap()
      .then(() => handleNavigateBack());
  };

  const handleNavigateBack = (): void => {
    navigate(`/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`);
  };

  const [assignCustomer] = useAssignCustomerMutation();
  const [removeCustomer] = useRemoveCustomerMutation();

  const resetLoadingId = (customerId: string): void => {
    setLoadingIds((oldLoadingIds) => oldLoadingIds.filter((id) => id !== customerId));
  };

  const setErrorId = (customerId: string): void => {
    setErrorIds((oldErrorIds) => [...oldErrorIds, customerId]);
  };

  const showConfirmationSnackbar = (message: string, color: 'success' | 'info'): void => {
    dismissSnackbar();
    openSnackbar({
      message: message,
      color: color,
      dismissable: false,
      className: classes.customerListSnackbar,
    });
  };

  const onAddCustomer = (customerId: string, customerName: string): void => {
    setLoadingIds((oldLoadingIds) => [...oldLoadingIds, customerId]);
    const onAddSuccess = (delegation: AgentDelegation) => {
      setDelegations((oldDelegations) => [...oldDelegations, delegation]);
      showConfirmationSnackbar(
        t('systemuser_agent_delegation.customer_added', {
          customerName,
        }),
        'success',
      );
    };
    assignCustomer({ partyId, systemUserId: id ?? '', customerId: customerId, partyUuid })
      .unwrap()
      .then(onAddSuccess)
      .catch(() => setErrorId(customerId))
      .finally(() => resetLoadingId(customerId));
  };

  const onRemoveCustomer = (toRemove: AgentDelegation, customerName: string): void => {
    setLoadingIds((oldLoadingIds) => [...oldLoadingIds, toRemove.customerId]);
    const onRemoveSuccess = () => {
      setDelegations((oldDelegations) =>
        oldDelegations.filter((delegation) => delegation.delegationId !== toRemove.delegationId),
      );
      showConfirmationSnackbar(
        t('systemuser_agent_delegation.customer_removed', {
          customerName,
        }),
        'info',
      );
    };
    removeCustomer({
      partyId,
      systemUserId: id ?? '',
      delegationId: toRemove.delegationId,
      partyUuid,
    })
      .unwrap()
      .then(onRemoveSuccess)
      .catch(() => setErrorId(toRemove.customerId))
      .finally(() => resetLoadingId(toRemove.customerId));
  };

  const enableAddCustomers = (): void => {
    modalRef.current?.showModal();
  };

  // need to use useCallback to get updated assignedIds in onClose
  const onCloseModal = useCallback(() => {
    modalRef.current?.close();
    setAssignedCustomers(getAssignedCustomers(customers, delegations));
  }, [customers, delegations]);

  return (
    <PageContainer
      onNavigateBack={handleNavigateBack}
      pageActions={
        systemUser && (
          <DeleteSystemUserPopover
            integrationTitle={systemUser.integrationTitle}
            isDeleteError={isDeleteError}
            isDeletingSystemUser={isDeletingSystemUser}
            handleDeleteSystemUser={handleDeleteSystemUser}
            hasAgentDelegation={assignedCustomers.length > 0}
          />
        )
      }
    >
      <Dialog
        ref={modalRef}
        className={classes.delegationModal}
        onClose={onCloseModal}
        closedby='any'
      >
        <div className={classes.flexContainer}>
          <Heading
            level={1}
            data-size='sm'
          >
            {t('systemuser_agent_delegation.assign_customers', {
              integrationTitle: systemUser?.integrationTitle,
            })}
          </Heading>
          <CustomerList
            list={customers}
            delegations={delegations}
            loadingIds={loadingIds}
            errorIds={errorIds}
            onAddCustomer={onAddCustomer}
            onRemoveCustomer={onRemoveCustomer}
          />
          <div>
            <Button onClick={onCloseModal}>{t('systemuser_agent_delegation.confirm_close')}</Button>
            <Snackbar className={classes.customerListSnackbar} />
          </div>
        </div>
      </Dialog>
      {systemUser && (
        <div className={classes.flexContainer}>
          <SystemUserHeader
            title={systemUser.integrationTitle}
            subTitle={reporteeData?.name}
          />
          <Heading
            level={2}
            data-size='xs'
          >
            {systemUser.accessPackages.length == 1
              ? t('systemuser_agent_delegation.access_package_single')
              : t('systemuser_agent_delegation.access_package_plural', {
                  accessPackageCount: systemUser.accessPackages.length,
                })}
          </Heading>
          <RightsList
            resources={[]}
            accessPackages={systemUser.accessPackages}
            hideHeadings
          />
          <Heading
            level={2}
            data-size='xs'
            className={classes.customerHeading}
          >
            {t('systemuser_agent_delegation.assigned_customers_header')}
          </Heading>
          {assignedCustomers.length === 0 ? (
            <>
              <Paragraph>{t('systemuser_agent_delegation.no_assigned_customers')}</Paragraph>
              <div>
                <Button
                  variant='secondary'
                  onClick={enableAddCustomers}
                >
                  <PlusIcon />
                  {t('systemuser_agent_delegation.add_customers')}
                </Button>
              </div>
            </>
          ) : (
            <CustomerList list={assignedCustomers}>
              <Button
                variant='secondary'
                onClick={enableAddCustomers}
              >
                <PencilIcon />
                {t('systemuser_agent_delegation.edit_customers')}
              </Button>
            </CustomerList>
          )}
          <Paragraph
            data-size='xs'
            className={classes.createdBy}
          >
            {t('systemuser_detailpage.created_by', {
              created: new Date(systemUser.created).toLocaleDateString('no-NB', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              }),
            })}
          </Paragraph>
        </div>
      )}
    </PageContainer>
  );
};
