import React from 'react';
import { Alert, Spinner } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import {
  useGetAssignedCustomersQuery,
  useGetAgentSystemUserQuery,
  useGetRegnskapsforerCustomersQuery,
  useGetRevisorCustomersQuery,
  useGetForretningsforerCustomersQuery,
} from '@/rtk/features/systemUserApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { PageWrapper } from '@/components';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageLayoutWrapper } from '@/features/amUI/common/PageLayoutWrapper';

import type { SystemUser } from '../types';

import { SystemUserAgentDelegationPageContent } from './SystemUserAgentDelegationPageContent';

const regnskapsforerUrns = [
  'urn:altinn:accesspackage:regnskapsforer-med-signeringsrettighet',
  'urn:altinn:accesspackage:regnskapsforer-uten-signeringsrettighet',
  'urn:altinn:accesspackage:regnskapsforer-lonn',
];
const revisorUrns = [
  'urn:altinn:accesspackage:ansvarlig-revisor',
  'urn:altinn:accesspackage:revisormedarbeider',
];
const forretningsforerUrns = ['urn:altinn:accesspackage:skattegrunnlag'];

enum SystemUserCustomerType {
  UNKNOWN = 'UNKNOWN',
  REGNSKAPSFORER = 'REGNSKAPSFORER',
  REVISOR = 'REVISOR',
  FORRETNINGSFORER = 'FORRETNINGSFORER',
}

const getSystemUserCustomerType = (systemUser: SystemUser | undefined): SystemUserCustomerType => {
  const accessPackageUrns = systemUser?.accessPackages.map((ap) => ap.urn) ?? [];
  if (accessPackageUrns.some((urn) => regnskapsforerUrns.includes(urn))) {
    return SystemUserCustomerType.REGNSKAPSFORER;
  } else if (accessPackageUrns.some((urn) => revisorUrns.includes(urn))) {
    return SystemUserCustomerType.REVISOR;
  } else if (accessPackageUrns.some((urn) => forretningsforerUrns.includes(urn))) {
    return SystemUserCustomerType.FORRETNINGSFORER;
  }
  return SystemUserCustomerType.UNKNOWN;
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
    skip: getSystemUserCustomerType(systemUser) !== SystemUserCustomerType.REGNSKAPSFORER,
  });

  const {
    data: revisorCustomers,
    isError: isLoadRevisorCustomersError,
    isLoading: isLoadingRevisorCustomers,
  } = useGetRevisorCustomersQuery(partyUuid, {
    skip: getSystemUserCustomerType(systemUser) !== SystemUserCustomerType.REVISOR,
  });

  const {
    data: forretningsforerCustomers,
    isError: isLoadForretningsforerCustomersError,
    isLoading: isLoadingForretningsforerCustomers,
  } = useGetForretningsforerCustomersQuery(partyUuid, {
    skip: getSystemUserCustomerType(systemUser) !== SystemUserCustomerType.FORRETNINGSFORER,
  });

  const {
    data: assignedIds,
    isError: isLoadAssignedCustomersError,
    isLoading: isLoadingAssignedCustomers,
  } = useGetAssignedCustomersQuery({ partyId, systemUserId: id || '' });

  const customers = regnskapsforerCustomers || revisorCustomers || forretningsforerCustomers;

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        {(isLoadingSystemUser ||
          isLoadingRegnskapsforerCustomers ||
          isLoadingRevisorCustomers ||
          isLoadingForretningsforerCustomers ||
          isLoadingAssignedCustomers) && (
          <Spinner aria-label={t('systemuser_detailpage.loading_systemuser')} />
        )}
        {isLoadSystemUserError && (
          <Alert data-color='danger'>{t('systemuser_detailpage.load_systemuser_error')}</Alert>
        )}
        {(isLoadRevisorCustomersError ||
          isLoadRegnskapsforerCustomersError ||
          isLoadForretningsforerCustomersError) && (
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
