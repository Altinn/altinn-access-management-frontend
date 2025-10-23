import React from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PlusIcon } from '@navikt/aksel-icons';
import { DsAlert, DsButton, DsHeading, DsParagraph, DsSpinner } from '@altinn/altinn-components';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import {
  useGetAgentSystemUsersQuery,
  useGetPendingSystemUserRequestsQuery,
  useGetSystemUserReporteeQuery,
  useGetSystemUsersQuery,
} from '@/rtk/features/systemUserApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { SystemUserPath } from '@/routes/paths';
import { PageLayoutWrapper } from '@/features/amUI/common/PageLayoutWrapper';

import classes from './SystemUserOverviewPage.module.css';
import { useGetIsClientAdminQuery } from '@/rtk/features/userInfoApi';
import { hasCreateSystemUserPermission } from '@/resources/utils/permissionUtils';
import { SystemUserList } from './SystemUserList';

export const SystemUserOverviewPage = () => {
  const { t } = useTranslation();
  useDocumentTitle(t('systemuser_overviewpage.page_title'));

  const partyId = getCookie('AltinnPartyId');

  const { data: isClientAdmin, isLoading: isLoadingClientAdmin } = useGetIsClientAdminQuery();
  const { data: reporteeData, isLoading: isLoadingReportee } =
    useGetSystemUserReporteeQuery(partyId);

  const {
    data: systemUsers,
    isLoading: isLoadingSystemUsers,
    isError: isLoadSystemUsersError,
  } = useGetSystemUsersQuery(partyId);

  const {
    data: agentSystemUsers,
    isLoading: isLoadingAgentSystemUsers,
    isError: isLoadAgentSystemUsersError,
  } = useGetAgentSystemUsersQuery(partyId);

  const {
    data: pendingSystemUsers,
    isLoading: isLoadingPendingSystemUsers,
    isError: isLoadPendingSystemUsersError,
  } = useGetPendingSystemUserRequestsQuery(partyId, {
    skip: !hasCreateSystemUserPermission(reporteeData),
  });

  const isLoading =
    isLoadingSystemUsers || isLoadingAgentSystemUsers || isLoadingReportee || isLoadingClientAdmin;

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <div className={classes.flexContainer}>
          <DsHeading
            level={1}
            data-size='sm'
          >
            {t('systemuser_overviewpage.banner_title')}
          </DsHeading>
          <DsParagraph
            data-size='sm'
            className={classes.systemUserIngress}
          >
            {t('systemuser_overviewpage.sub_title_text')}
          </DsParagraph>
          {isLoading && <DsSpinner aria-label={t('systemuser_overviewpage.loading_systemusers')} />}
          {!isLoading && (
            <>
              {isClientAdmin === false && hasCreateSystemUserPermission(reporteeData) === false && (
                <DsAlert
                  data-color='warning'
                  className={classes.noPermissionsWarning}
                >
                  {t('systemuser_overviewpage.no_permissions_warning')}
                </DsAlert>
              )}
              {pendingSystemUsers && pendingSystemUsers.length > 0 && (
                <SystemUserList
                  systemUsers={pendingSystemUsers}
                  isPendingRequestList
                  listHeading='Ventende systembrukere'
                />
              )}
              {systemUsers && (
                <SystemUserList
                  systemUsers={systemUsers}
                  listHeading={t('systemuser_overviewpage.existing_system_users_title')}
                  headerContent={
                    hasCreateSystemUserPermission(reporteeData) && <CreateSystemUserButton />
                  }
                />
              )}
              {isLoadSystemUsersError && (
                <DsAlert data-color='danger'>
                  {t('systemuser_overviewpage.systemusers_load_error')}
                </DsAlert>
              )}
              {agentSystemUsers && agentSystemUsers.length > 0 && (
                <SystemUserList
                  systemUsers={agentSystemUsers}
                  listHeading={t('systemuser_overviewpage.agent_delegation_systemusers_title')}
                />
              )}
              {isLoadAgentSystemUsersError && (
                <DsAlert data-color='danger'>
                  {t('systemuser_overviewpage.agent_delegation_systemusers_load_error')}
                </DsAlert>
              )}
            </>
          )}
        </div>
      </PageLayoutWrapper>
    </PageWrapper>
  );
};

const CreateSystemUserButton = (): React.ReactNode => {
  const { t } = useTranslation();
  return (
    <DsButton
      variant='secondary'
      asChild
    >
      <Link to={`/${SystemUserPath.SystemUser}/${SystemUserPath.Create}`}>
        <PlusIcon
          fontSize={28}
          aria-hidden
        />
        {t('systemuser_overviewpage.new_system_user_button')}
      </Link>
    </DsButton>
  );
};
