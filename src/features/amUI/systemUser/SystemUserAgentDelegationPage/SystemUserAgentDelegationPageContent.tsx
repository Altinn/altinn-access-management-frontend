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
import type { Customer, SystemUser } from '../types';
import { DeleteSystemUserPopover } from '../components/DeleteSystemUserPopover/DeleteSystemUserPopover';

import classes from './SystemUserAgentDelegationPage.module.css';
import { CustomerList } from './CustomerList';

const getAssignedCustomers = (customers: Customer[], assignedIds: string[]): Customer[] => {
  return customers.filter((customer) => assignedIds.indexOf(customer.id) > -1);
};

interface SystemUserAgentDelegationPageContentProps {
  systemUser: SystemUser;
  customers: Customer[];
  initialAssignedIds: string[];
}
export const SystemUserAgentDelegationPageContent = ({
  systemUser,
  customers,
  initialAssignedIds,
}: SystemUserAgentDelegationPageContentProps): React.ReactNode => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const partyId = getCookie('AltinnPartyId');
  const { id } = useParams();
  const modalRef = useRef<HTMLDialogElement>(null);

  const [assignedIds, setAssignedIds] = useState<string[]>(initialAssignedIds);
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const [errorIds, setErrorIds] = useState<string[]>([]);
  const [assignedCustomers, setAssignedCustomers] = useState<Customer[]>(
    getAssignedCustomers(customers, initialAssignedIds),
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

  const onAddCustomer = (customerId: string): void => {
    const successCallback = () =>
      setAssignedIds((oldAssignedIds) => [...oldAssignedIds, customerId]);
    mutateCustomer(assignCustomer, successCallback, customerId);
  };

  const onRemoveCustomer = (customerId: string): void => {
    const successCallback = () =>
      setAssignedIds((oldAssignedIds) => oldAssignedIds.filter((id) => id !== customerId));
    mutateCustomer(removeCustomer, successCallback, customerId);
  };

  const mutateCustomer = (
    mutationPromise: typeof removeCustomer | typeof assignCustomer,
    successCallback: () => void,
    customerId: string,
  ) => {
    setLoadingIds((oldLoadingIds) => [...oldLoadingIds, customerId]);
    setErrorIds((oldErrorIds) => oldErrorIds.filter((id) => id !== customerId));
    mutationPromise({ partyId, systemUserId: id ?? '', customerId })
      .unwrap()
      .then(() => {
        successCallback();
      })
      .catch(() => {
        setErrorIds((oldErrorIds) => [...oldErrorIds, customerId]);
      })
      .finally(() => {
        setLoadingIds((oldLoadingIds) => oldLoadingIds.filter((id) => id !== customerId));
      });
  };

  const enableAddCustomers = (): void => {
    modalRef.current?.showModal();
  };

  // need to use useCallback to get updated assignedIds in onClose
  const onCloseModal = useCallback(() => {
    modalRef.current?.close();
    setAssignedCustomers(getAssignedCustomers(customers, assignedIds));
  }, [customers, assignedIds]);

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
            assignedIds={assignedIds}
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
