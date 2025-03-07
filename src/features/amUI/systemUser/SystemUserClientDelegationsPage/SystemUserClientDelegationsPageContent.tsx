import React, { useState } from 'react';
import { Paragraph, Heading, Button } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { PencilIcon, PlusIcon } from '@navikt/aksel-icons';

import { SystemUserHeader } from '../components/SystemUserHeader/SystemUserHeader';
import type { Customer, SystemUser } from '../types';

import classes from './SystemUserClientDelegationsPage.module.css';
import { CustomerList } from './CustomerList';

import { useAssignCustomerMutation, useRemoveCustomerMutation } from '@/rtk/features/systemUserApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { SystemUserPath } from '@/routes/paths';
import { PageContainer } from '@/features/amUI/common/PageContainer/PageContainer';

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

  const [isAddCustomerMode, setIsAddCustomerMode] = useState<boolean>(false);
  const [delegatedIds, setDelegatedIds] = useState<string[]>(initialAssignedIds);
  const [loadingIds, setLoadingIds] = useState<string[]>([]);

  const handleNavigateBack = (): void => {
    if (isAddCustomerMode) {
      setIsAddCustomerMode(false);
    } else {
      navigate(`/${SystemUserPath.SystemUser}/${SystemUserPath.Overview}`);
    }
  };

  // TODO: legg på feilhåndtering dersom assign eller remove feiler
  const [assignCustomer] = useAssignCustomerMutation();
  const [removeCustomer] = useRemoveCustomerMutation();

  const onAddCustomer = (customerId: string): void => {
    setLoadingIds((oldLoadingIds) => [...oldLoadingIds, customerId]);
    assignCustomer({ partyId, systemUserId: id ?? '', customerId })
      .unwrap()
      .then(() => {
        setDelegatedIds((oldDelegatedIds) => [...oldDelegatedIds, customerId]);
      })
      .finally(() => {
        setLoadingIds((oldLoadingIds) => oldLoadingIds.filter((id) => id !== customerId));
      });
  };

  const onRemoveCustomer = (customerId: string): void => {
    setLoadingIds((oldLoadingIds) => [...oldLoadingIds, customerId]);
    removeCustomer({ partyId, systemUserId: id ?? '', customerId })
      .unwrap()
      .then(() => {
        setDelegatedIds((oldDelegatedIds) => oldDelegatedIds.filter((id) => id !== customerId));
      })
      .finally(() => {
        setLoadingIds((oldLoadingIds) => oldLoadingIds.filter((id) => id !== customerId));
      });
  };

  const enableAddCustomers = (): void => {
    setIsAddCustomerMode(true);
  };

  return (
    <PageContainer onNavigateBack={handleNavigateBack}>
      {isAddCustomerMode && (
        <div className={classes.flexContainer}>
          <Heading
            level={1}
            data-size='md'
          >
            {t('systemuser_client_delegation.my_customers_header')}
          </Heading>
          <Paragraph>
            {t('systemuser_client_delegation.assign_customers', {
              integrationTitle: systemUser?.integrationTitle,
            })}
          </Paragraph>
          <div>
            <CustomerList
              list={customers}
              assignedIds={delegatedIds}
              loadingIds={loadingIds}
              onAddCustomer={onAddCustomer}
              onRemoveCustomer={onRemoveCustomer}
            />
          </div>
        </div>
      )}
      {systemUser && !isAddCustomerMode && (
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
              assignedIds={delegatedIds}
              loadingIds={loadingIds}
              onAddCustomer={onAddCustomer}
            >
              <Button
                variant='secondary'
                data-size='sm'
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
