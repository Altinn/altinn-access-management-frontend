import React from 'react';
import { Alert, Spinner } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

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

export const SystemUserAgentDelegationPage = (): React.ReactNode => {
  const { id } = useParams();
  const { t } = useTranslation();
  const partyId = getCookie('AltinnPartyUuid');

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
  } = useGetCustomersQuery({ partyId, systemUserId: id ?? '' });

  const {
    data: agentDelegations,
    isError: isLoadAssignedCustomersError,
    isLoading: isLoadingAssignedCustomers,
  } = useGetAssignedCustomersQuery({
    partyId: partyId,
    systemUserId: id || '',
  });

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        {(isLoadingSystemUser || isLoadingCustomers || isLoadingAssignedCustomers) && (
          <Spinner aria-label={t('systemuser_detailpage.loading_systemuser')} />
        )}
        {isLoadSystemUserError && (
          <Alert data-color='danger'>{t('systemuser_detailpage.load_systemuser_error')}</Alert>
        )}
        {isLoadCustomersError && (
          <Alert data-color='danger'>{t('systemuser_agent_delegation.load_customers_error')}</Alert>
        )}
        {isLoadAssignedCustomersError && (
          <Alert data-color='danger'>
            {t('systemuser_agent_delegation.load_assigned_customers_error')}
          </Alert>
        )}
        {systemUser && customers && agentDelegations && (
          <SystemUserAgentDelegationPageContent
            systemUser={systemUser}
            customers={customers}
            existingAgentDelegations={agentDelegations}
          />
        )}
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
