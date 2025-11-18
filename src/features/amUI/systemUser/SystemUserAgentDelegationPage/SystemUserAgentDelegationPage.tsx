import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { SnackbarProvider, DsSpinner, DsAlert } from '@altinn/altinn-components';

import {
  useGetAssignedCustomersQuery,
  useGetAgentSystemUserQuery,
  useGetCustomersQuery,
} from '@/rtk/features/systemUserApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { PageWrapper } from '@/components';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageLayoutWrapper } from '@/features/amUI/common/PageLayoutWrapper';

import { SystemUserAgentDelegationPageContent } from './SystemUserAgentDelegationPageContent';
import { Breadcrumbs } from '../../common/Breadcrumbs/Breadcrumbs';
import { useBreadcrumbs } from '../../common/Breadcrumbs/BreadcrumbsContext';

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
    data: customers,
    isError: isLoadCustomersError,
    isLoading: isLoadingCustomers,
  } = useGetCustomersQuery({ partyId, systemUserId: id ?? '', partyUuid });

  const {
    data: agentDelegations,
    isError: isLoadAssignedCustomersError,
    isLoading: isLoadingAssignedCustomers,
  } = useGetAssignedCustomersQuery({
    partyId: partyId,
    systemUserId: id || '',
    partyUuid,
  });

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <AgentDelegationBreadcrumbs title={systemUser?.integrationTitle} />
        {(isLoadingSystemUser || isLoadingCustomers || isLoadingAssignedCustomers) && (
          <DsSpinner aria-label={t('systemuser_detailpage.loading_systemuser')} />
        )}
        {isLoadSystemUserError && (
          <DsAlert data-color='danger'>{t('systemuser_detailpage.load_systemuser_error')}</DsAlert>
        )}
        {isLoadCustomersError && (
          <DsAlert data-color='danger'>
            {t('systemuser_agent_delegation.load_customers_error')}
          </DsAlert>
        )}
        {isLoadAssignedCustomersError && (
          <DsAlert data-color='danger'>
            {t('systemuser_agent_delegation.load_assigned_customers_error')}
          </DsAlert>
        )}
        {systemUser && customers && agentDelegations && (
          <SnackbarProvider>
            <SystemUserAgentDelegationPageContent
              systemUser={systemUser}
              customers={customers}
              existingAgentDelegations={agentDelegations}
            />
          </SnackbarProvider>
        )}
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

const AgentDelegationBreadcrumbs = ({ title }: { title?: string }) => {
  const { setLastBreadcrumb } = useBreadcrumbs();
  useEffect(() => {
    setLastBreadcrumb(title);
  }, [title]);

  return <Breadcrumbs />;
};
