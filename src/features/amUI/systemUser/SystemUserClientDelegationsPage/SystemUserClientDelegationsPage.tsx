import React, { useState } from 'react';
import { Alert, Spinner, Paragraph, Heading, Button } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { PencilIcon, PlusIcon } from '@navikt/aksel-icons';

import { SystemUserHeader } from '../components/SystemUserHeader/SystemUserHeader';
import type { Customer, SystemUser } from '../types';

import classes from './SystemUserClientDelegationsPage.module.css';
import { CustomerList } from './CustomerList';

import {
  useAssignCustomerMutation,
  useGetAssignedCustomersQuery,
  useGetClientSystemUserQuery,
  useGetRegnskapsforerCustomersQuery,
  useGetRevisorCustomersQuery,
  useRemoveCustomerMutation,
} from '@/rtk/features/systemUserApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { PageWrapper } from '@/components';
import { SystemUserPath } from '@/routes/paths';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageContainer } from '@/features/amUI/common/PageContainer/PageContainer';
import { PageLayoutWrapper } from '@/features/amUI/common/PageLayoutWrapper';

const isRegnskapsforerSystemUser = (systemUser: SystemUser | undefined): boolean => {
  return (
    systemUser?.accessPackages.some(
      (accessPackage) =>
        accessPackage.urn === 'urn:altinn:accesspackage:regnskapsforer-med-signeringsrettighet' ||
        accessPackage.urn === 'urn:altinn:accesspackage:regnskapsforer-uten-signeringsrettighet' ||
        accessPackage.urn === 'urn:altinn:accesspackage:regnskapsforer-lonn',
    ) ?? false
  );
};

const isRevisorSystemUser = (systemUser: SystemUser | undefined): boolean => {
  return (
    systemUser?.accessPackages.some(
      (accessPackage) =>
        accessPackage.urn === 'urn:altinn:accesspackage:ansvarlig-revisor' ||
        accessPackage.urn === 'urn:altinn:accesspackage:revisormedarbeider',
    ) ?? false
  );
};

export const SystemUserClientDelegationsPage = (): React.ReactNode => {
  const { id } = useParams();
  const { t } = useTranslation();
  const partyId = getCookie('AltinnPartyId');
  const partyUuid = getCookie('AltinnPartyUuid');

  useDocumentTitle(t('systemuser_overviewpage.page_title'));

  const {
    data: systemUser,
    isError: isLoadSystemUserError,
    isLoading: isLoadingSystemUser,
  } = useGetClientSystemUserQuery({ partyId, systemUserId: id || '' });

  const {
    data: regnskapsforerCustomers,
    isError: isLoadRegnskapsforerCustomersError,
    isLoading: isLoadingRegnskapsforerCustomers,
  } = useGetRegnskapsforerCustomersQuery(partyUuid, {
    skip: !isRegnskapsforerSystemUser(systemUser),
  });

  const {
    data: revisorCustomers,
    isError: isLoadRevisorCustomersError,
    isLoading: isLoadingRevisorCustomers,
  } = useGetRevisorCustomersQuery(partyUuid, {
    skip: !isRevisorSystemUser(systemUser),
  });

  const {
    data: assignedIds,
    isError: isLoadAssignedCustomersError,
    isLoading: isLoadingAssignedCustomers,
  } = useGetAssignedCustomersQuery({ partyId, systemUserId: id || '' });

  const customers = regnskapsforerCustomers ?? revisorCustomers;

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        {(isLoadingSystemUser ||
          isLoadingRegnskapsforerCustomers ||
          isLoadingRevisorCustomers ||
          isLoadingAssignedCustomers) && (
          <Spinner aria-label={t('systemuser_detailpage.loading_systemuser')} />
        )}
        {isLoadSystemUserError && (
          <Alert data-color='danger'>{t('systemuser_detailpage.load_systemuser_error')}</Alert>
        )}
        {(isLoadRevisorCustomersError || isLoadRegnskapsforerCustomersError) && (
          <Alert data-color='danger'>Kunne ikke laste kunder</Alert>
        )}
        {isLoadAssignedCustomersError && (
          <Alert data-color='danger'>Kunne ikke laste tilknyttede kunder</Alert>
        )}
        {systemUser && customers && assignedIds && (
          <SystemUserClientDelegationsPageContent
            systemUser={systemUser}
            customers={customers}
            initialAssignedIds={assignedIds}
          />
        )}
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
interface SystemUserClientDelegationsPageContentProps {
  systemUser: SystemUser;
  customers: Customer[];
  initialAssignedIds: string[];
}
const SystemUserClientDelegationsPageContent = ({
  systemUser,
  customers,
  initialAssignedIds,
}: SystemUserClientDelegationsPageContentProps): React.ReactNode => {
  const navigate = useNavigate();
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
            {`Mine kunder i enhetsregisteret`}
          </Heading>
          <Paragraph>{`Legg til flere kunder til systemtilgangen ${systemUser?.integrationTitle}.`}</Paragraph>
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
            title={'systemuser_client_delegation_overview.banner_title'}
            integrationTitle={systemUser.integrationTitle}
          />
          <Heading
            level={2}
            data-size='sm'
          >
            {`Kunder i systemtilgangen`}
          </Heading>
          {delegatedIds.length === 0 ? (
            <>
              <Paragraph>{'Denne systemtilgangen har ingen kunder.'}</Paragraph>
              <div>
                <Button
                  variant='secondary'
                  onClick={enableAddCustomers}
                >
                  <PlusIcon />
                  {'Legg til kunder'}
                </Button>
              </div>
            </>
          ) : (
            <>
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
                  {'Administrer kunder'}
                </Button>
              </CustomerList>
            </>
          )}
        </div>
      )}
    </PageContainer>
  );
};
