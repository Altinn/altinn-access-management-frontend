import React, { useRef, useState } from 'react';
import { Paragraph, Heading, Button, Dialog } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { PencilIcon, PlusIcon } from '@navikt/aksel-icons';

import { useAssignCustomerMutation, useRemoveCustomerMutation } from '@/rtk/features/systemUserApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { SystemUserPath } from '@/routes/paths';
import { PageContainer } from '@/features/amUI/common/PageContainer/PageContainer';

import { SystemUserHeader } from '../components/SystemUserHeader/SystemUserHeader';
import type { Customer, SystemUser } from '../types';

import classes from './SystemUserClientDelegationsPage.module.css';
import { CustomerList } from './CustomerList';

interface SystemUserClientDelegationsPageContentProps {
  systemUser: SystemUser;
  customers: Customer[];
  initialAssignedIds: string[];
}
export const SystemUserClientDelegationsPageContent = ({
  systemUser,
  customers,
  initialAssignedIds,
}: SystemUserClientDelegationsPageContentProps): React.ReactNode => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const partyId = getCookie('AltinnPartyId');
  const { id } = useParams();
  const modalRef = useRef<HTMLDialogElement>(null);

  const [delegatedIds, setDelegatedIds] = useState<string[]>(initialAssignedIds);
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const [errorIds, setErrorIds] = useState<string[]>([]);

  const handleNavigateBack = (): void => {
    navigate(`/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`);
  };

  const [assignCustomer] = useAssignCustomerMutation();
  const [removeCustomer] = useRemoveCustomerMutation();

  const onAddCustomer = (customerId: string): void => {
    const successCallback = () =>
      setDelegatedIds((oldDelegatedIds) => [...oldDelegatedIds, customerId]);
    mutateCustomer(assignCustomer, successCallback, customerId);
  };

  const onRemoveCustomer = (customerId: string): void => {
    const successCallback = () =>
      setDelegatedIds((oldDelegatedIds) => oldDelegatedIds.filter((id) => id !== customerId));
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

  return (
    <PageContainer onNavigateBack={handleNavigateBack}>
      <Dialog
        ref={modalRef}
        style={{
          maxWidth: 950,
        }}
      >
        <div className={classes.flexContainer}>
          <Heading
            level={1}
            data-size='sm'
          >
            {t('systemuser_client_delegation.assign_customers', {
              integrationTitle: systemUser?.integrationTitle,
            })}
          </Heading>
          <div>
            <CustomerList
              list={customers}
              assignedIds={delegatedIds}
              loadingIds={loadingIds}
              errorIds={errorIds}
              onAddCustomer={onAddCustomer}
              onRemoveCustomer={onRemoveCustomer}
            />
          </div>
        </div>
      </Dialog>
      {systemUser && (
        <div className={classes.flexContainer}>
          <SystemUserHeader
            title={'systemuser_client_delegation.banner_title'}
            integrationTitle={systemUser.integrationTitle}
          />
          <Heading
            level={2}
            data-size='sm'
          >
            {t('systemuser_client_delegation.assigned_customers_header')}
          </Heading>
          {delegatedIds.length === 0 ? (
            <>
              <Paragraph>{t('systemuser_client_delegation.no_assigned_customers')}</Paragraph>
              <div>
                <Button
                  variant='secondary'
                  onClick={enableAddCustomers}
                >
                  <PlusIcon />
                  {t('systemuser_client_delegation.add_customers')}
                </Button>
              </div>
            </>
          ) : (
            <CustomerList
              list={customers.filter((customer) => delegatedIds.indexOf(customer.id) > -1)}
            >
              <Button
                variant='secondary'
                onClick={enableAddCustomers}
              >
                <PencilIcon />
                {t('systemuser_client_delegation.edit_customers')}
              </Button>
            </CustomerList>
          )}
        </div>
      )}
    </PageContainer>
  );
};
