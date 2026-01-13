import React from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PlusIcon } from '@navikt/aksel-icons';
import {
  DsAlert,
  DsButton,
  DsHeading,
  DsParagraph,
  DsSkeleton,
  List,
  ListItem,
} from '@altinn/altinn-components';

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
import { useGetIsAdminQuery, useGetIsClientAdminQuery } from '@/rtk/features/userInfoApi';
import { hasCreateSystemUserPermission } from '@/resources/utils/permissionUtils';
import { SystemUserList } from './SystemUserList';
import { Breadcrumbs } from '../../common/Breadcrumbs/Breadcrumbs';

export const SystemUserOverviewPage = () => {
  const { t } = useTranslation();
  useDocumentTitle(t('systemuser_overviewpage.page_title'));

  const partyId = getCookie('AltinnPartyId');
  const partyUuid = getCookie('AltinnPartyUuid') || '';

  const { data: isAdmin, isLoading: isLoadingIsAdmin } = useGetIsAdminQuery();
  const { data: isClientAdmin, isLoading: isLoadingClientAdmin } = useGetIsClientAdminQuery();
  const { data: reporteeData, isLoading: isLoadingReportee } =
    useGetSystemUserReporteeQuery(partyId);

  // load only for isAdmin
  const {
    data: systemUsers,
    isLoading: isLoadingSystemUsers,
    isError: isLoadSystemUsersError,
  } = useGetSystemUsersQuery(partyId, {
    skip: !isAdmin,
  });

  // load for isAdmin and isClientAdmin
  const {
    data: agentSystemUsers,
    isLoading: isLoadingAgentSystemUsers,
    isError: isLoadAgentSystemUsersError,
  } = useGetAgentSystemUsersQuery(partyId, {
    skip: !isAdmin && !isClientAdmin,
  });

  const {
    data: pendingSystemUsers,
    isLoading: isLoadingPendingSystemUsers,
    isError: isLoadPendingSystemUsersError,
  } = useGetPendingSystemUserRequestsQuery(partyUuid, {
    skip: !hasCreateSystemUserPermission(reporteeData, isAdmin),
  });

  const isLoading =
    isLoadingSystemUsers ||
    isLoadingAgentSystemUsers ||
    isLoadingReportee ||
    isLoadingClientAdmin ||
    isLoadingPendingSystemUsers ||
    isLoadingIsAdmin;

  return (
    <PageWrapper>
      <PageLayoutWrapper>
        <Breadcrumbs items={['root', 'systemuser_overview']} />
        <DsHeading
          level={1}
          data-size='sm'
          className={classes.systemUserTopHeader}
        >
          {t('systemuser_overviewpage.banner_title')}
        </DsHeading>
        <div className={classes.flexContainer}>
          <DsParagraph
            data-size='sm'
            className={classes.systemUserIngress}
          >
            {t('systemuser_overviewpage.sub_title_text')}
          </DsParagraph>
          {isLoading && (
            <>
              <div className={classes.systemUserHeader}>
                <DsSkeleton
                  height={40}
                  width={300}
                />
              </div>
              <List>
                <LoadingListItem />
                <LoadingListItem />
                <LoadingListItem />
              </List>
            </>
          )}
          {!isLoading && (
            <>
              {isClientAdmin === false &&
                hasCreateSystemUserPermission(reporteeData, isAdmin) === false && (
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
                  listHeading={t('systemuser_overviewpage.pending_system_users_title')}
                />
              )}
              {isLoadPendingSystemUsersError && (
                <DsAlert data-color='danger'>
                  {t('systemuser_overviewpage.pending_systemusers_load_error')}
                </DsAlert>
              )}
              {systemUsers && (
                <SystemUserList
                  systemUsers={systemUsers}
                  listHeading={t('systemuser_overviewpage.existing_system_users_title')}
                  headerContent={
                    hasCreateSystemUserPermission(reporteeData, isAdmin) && (
                      <CreateSystemUserButton />
                    )
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

const LoadingListItem = () => {
  return (
    <ListItem
      loading
      icon={PlusIcon}
      title={'xxxxxxxxxxxxxxxxxxxx'}
      size='lg'
      interactive={false}
      badge={
        <div className={classes.systemUserBadge}>
          <DsSkeleton
            variant='text'
            width={20}
          />
        </div>
      }
    />
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
