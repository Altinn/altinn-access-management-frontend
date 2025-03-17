import React from 'react';
import { Alert, Spinner } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import {
  useGetAssignedCustomersQuery,
  useGetAgentSystemUserQuery,
  useGetRegnskapsforerCustomersQuery,
  useGetRevisorCustomersQuery,
} from '@/rtk/features/systemUserApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { PageWrapper } from '@/components';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageLayoutWrapper } from '@/features/amUI/common/PageLayoutWrapper';

import type { SystemUser } from '../types';

import { SystemUserAgentDelegationPageContent } from './SystemUserAgentDelegationPageContent';

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

export const SystemUserAgentDelegationPage = (): React.ReactNode => {
  const { id } = useParams();
  const { t } = useTranslation();
  const partyId = getCookie('AltinnPartyId');
  const partyUuid = getCookie('AltinnPartyUuid');

  useDocumentTitle(t('systemuser_agent_delegation.page_title'));

  const {
    data: systemUser,
    isError: isLoadSystemUserError,
    isLoading: isLoadingSystemUser,
  } = useGetAgentSystemUserQuery({ partyId, systemUserId: id || '' });

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
          <Alert data-color='danger'>{t('systemuser_agent_delegation.load_customers_error')}</Alert>
        )}
        {isLoadAssignedCustomersError && (
          <Alert data-color='danger'>
            {t('systemuser_agent_delegation.load_assigned_customers_error')}
          </Alert>
        )}
        {systemUser && customers && assignedIds && (
          <SystemUserAgentDelegationPageContent
            systemUser={systemUser}
            customers={customers}
            initialAssignedIds={assignedIds.map((assigned) => assigned.partyId)}
          />
        )}
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
