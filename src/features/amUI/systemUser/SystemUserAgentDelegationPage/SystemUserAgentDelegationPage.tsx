import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { SnackbarProvider, DsAlert, DsHeading, DsSkeleton } from '@altinn/altinn-components';

import {
  useGetAssignedCustomersQuery,
  useGetAgentSystemUserQuery,
  useGetCustomersQuery,
  useDeleteAgentSystemuserMutation,
  useGetSystemUserReporteeQuery,
} from '@/rtk/features/systemUserApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { PageWrapper } from '@/components';
import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageLayoutWrapper } from '@/features/amUI/common/PageLayoutWrapper';

import { SystemUserAgentDelegationPageContent } from './SystemUserAgentDelegationPageContent';
import { Breadcrumbs } from '../../common/Breadcrumbs/Breadcrumbs';
import { SystemUserHeader } from '../components/SystemUserHeader/SystemUserHeader';
import { RightsList } from '../components/RightsList/RightsList';
import classes from './SystemUserAgentDelegationPage.module.css';
import { PageContainer } from '../../common/PageContainer/PageContainer';
import { SystemUserPath } from '@/routes/paths';
import { hasCreateSystemUserPermission } from '@/resources/utils/permissionUtils';
import { DeleteSystemUserPopover } from '../components/DeleteSystemUserPopover/DeleteSystemUserPopover';
import { useGetIsAdminQuery } from '@/rtk/features/userInfoApi';

export const SystemUserAgentDelegationPage = (): React.ReactNode => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
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
  const { data: reporteeData } = useGetSystemUserReporteeQuery(partyId);
  const { data: isAdmin } = useGetIsAdminQuery();

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

  const isLoading = isLoadingSystemUser || isLoadingCustomers || isLoadingAssignedCustomers;

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <Breadcrumbs
          items={['root', 'systemuser_overview']}
          lastBreadcrumb={{ label: systemUser?.integrationTitle }}
        />
        <PageContainer
          onNavigateBack={handleNavigateBack}
          pageActions={
            systemUser &&
            hasCreateSystemUserPermission(reporteeData, isAdmin) && (
              <DeleteSystemUserPopover
                integrationTitle={systemUser.integrationTitle}
                isDeleteError={isDeleteError}
                isDeletingSystemUser={isDeletingSystemUser}
                handleDeleteSystemUser={handleDeleteSystemUser}
                hasAgentDelegation={!!agentDelegations?.length}
              />
            )
          }
        >
          {isLoading && (
            <div className={classes.flexContainer}>
              <SystemUserHeader
                isLoading
                title=''
              />
              <DsHeading data-size='xs'>
                <DsSkeleton
                  variant='text'
                  width={20}
                />
              </DsHeading>
              <RightsList
                isLoading
                resources={[]}
                accessPackages={[]}
                hideHeadings
              />
            </div>
          )}
          {isLoadSystemUserError && (
            <DsAlert data-color='danger'>
              {t('systemuser_detailpage.load_systemuser_error')}
            </DsAlert>
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
        </PageContainer>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};
