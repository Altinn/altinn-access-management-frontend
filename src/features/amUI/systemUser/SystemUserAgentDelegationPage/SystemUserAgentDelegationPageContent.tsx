import React, { useCallback, useRef, useState } from 'react';
import { Paragraph, Heading, Button, Dialog } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { PencilIcon, PlusIcon } from '@navikt/aksel-icons';

import { getCookie } from '@/resources/Cookie/CookieMethods';
import {
  useAssignCustomerMutation,
  useDeleteSystemuserMutation,
  useRemoveCustomerMutation,
} from '@/rtk/features/systemUserApi';
import { PageContainer } from '@/features/amUI/common/PageContainer/PageContainer';
import { SystemUserPath } from '@/routes/paths';

import { SystemUserHeader } from '../components/SystemUserHeader/SystemUserHeader';
import type { AgentDelegation, AgentDelegationCustomer, SystemUser } from '../types';
import { DeleteSystemUserPopover } from '../components/DeleteSystemUserPopover/DeleteSystemUserPopover';

import classes from './SystemUserAgentDelegationPage.module.css';
import { CustomerList } from './CustomerList';

const getAssignedCustomers = (
  customers: AgentDelegationCustomer[],
  existingAgentDelegations: AgentDelegation[],
): AgentDelegationCustomer[] => {
  const assignedCustomerIds = existingAgentDelegations.map((x) => x.customerId);
  return customers.filter((customer) => assignedCustomerIds.indexOf(customer.uuid) > -1);
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

  const [deleteSystemUser, { isError: isDeleteError, isLoading: isDeletingSystemUser }] =
    useDeleteSystemuserMutation();

  const handleDeleteSystemUser = (): void => {
    deleteSystemUser({ partyId, systemUserId: id || '' })
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

  const onAddCustomer = (customerId: string): void => {
    setLoadingIds((oldLoadingIds) => [...oldLoadingIds, customerId]);
    const onAddSuccess = (delegation: AgentDelegation) => {
      setDelegations((oldDelegations) => [...oldDelegations, delegation]);
    };
    assignCustomer({ partyId, systemUserId: id ?? '', customerId: customerId, partyUuid })
      .unwrap()
      .then(onAddSuccess)
      .catch(() => setErrorId(customerId))
      .finally(() => resetLoadingId(customerId));
  };

  const onRemoveCustomer = (toRemove: AgentDelegation): void => {
    setLoadingIds((oldLoadingIds) => [...oldLoadingIds, toRemove.customerId]);
    const onRemoveSuccess = () => {
      setDelegations((oldDelegations) =>
        oldDelegations.filter((delegation) => delegation.assignmentId !== toRemove.assignmentId),
      );
    };
    removeCustomer({
      partyId,
      systemUserId: id ?? '',
      assignmentId: toRemove.assignmentId,
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
        </div>
      </Dialog>
      {systemUser && (
        <div className={classes.flexContainer}>
          <SystemUserHeader
            title={'systemuser_agent_delegation.banner_title'}
            integrationTitle={systemUser.integrationTitle}
          />
          <Heading
            level={2}
            data-size='sm'
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
