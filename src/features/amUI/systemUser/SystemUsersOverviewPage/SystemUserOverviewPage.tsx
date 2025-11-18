import React from 'react';
import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PlusIcon, TenancyIcon } from '@navikt/aksel-icons';
import {
  DsAlert,
  DsButton,
  DsHeading,
  DsParagraph,
  DsSpinner,
  List,
  ListItem,
} from '@altinn/altinn-components';

import { useDocumentTitle } from '@/resources/hooks/useDocumentTitle';
import { PageWrapper } from '@/components';
import {
  useGetAgentSystemUsersQuery,
  useGetSystemUserReporteeQuery,
  useGetSystemUsersQuery,
} from '@/rtk/features/systemUserApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { SystemUserPath } from '@/routes/paths';
import { PageLayoutWrapper } from '@/features/amUI/common/PageLayoutWrapper';

import type { SystemUser } from '../types';

import classes from './SystemUserOverviewPage.module.css';
import { useGetIsClientAdminQuery } from '@/rtk/features/userInfoApi';
import { hasCreateSystemUserPermission } from '@/resources/utils/permissionUtils';

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

  const isLoading =
    isLoadingSystemUsers || isLoadingAgentSystemUsers || isLoadingReportee || isLoadingClientAdmin;

  return (
    <PageWrapper>
      <PageLayoutWrapper>
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
              {systemUsers && (
                <>
                  <div className={classes.listHeader}>
                    {systemUsers.length > 0 && (
                      <DsHeading
                        level={2}
                        data-size='xs'
                        className={classes.systemUserHeader}
                      >
                        {t('systemuser_overviewpage.existing_system_users_title')}
                      </DsHeading>
                    )}
                    {hasCreateSystemUserPermission(reporteeData) && <CreateSystemUserButton />}
                  </div>
                  <SystemUserList systemUsers={systemUsers} />
                </>
              )}
              {isLoadSystemUsersError && (
                <DsAlert data-color='danger'>
                  {t('systemuser_overviewpage.systemusers_load_error')}
                </DsAlert>
              )}
              {agentSystemUsers && agentSystemUsers.length > 0 && (
                <>
                  <div className={classes.listHeader}>
                    <DsHeading
                      level={2}
                      data-size='xs'
                      className={classes.systemUserHeader}
                    >
                      {t('systemuser_overviewpage.agent_delegation_systemusers_title')}
                    </DsHeading>
                  </div>
                  <SystemUserList
                    systemUsers={agentSystemUsers}
                    isAgentList
                  />
                </>
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

interface SystemUserListProps {
  systemUsers: SystemUser[];
  isAgentList?: boolean;
}
const SystemUserList = ({ systemUsers, isAgentList }: SystemUserListProps) => {
  const { t } = useTranslation();
  const routerLocation = useLocation();

  const newlyCreatedId = routerLocation?.state?.createdId;

  return (
    <List>
      {systemUsers?.map((systemUser) => (
        <ListItem
          key={systemUser.id}
          size='lg'
          title={{ children: systemUser.integrationTitle, as: 'h3' }}
          description={systemUser.system.systemVendorOrgName}
          as={(props) => (
            <Link
              to={
                isAgentList
                  ? `/systemuser/${systemUser.id}/agentdelegation`
                  : `/systemuser/${systemUser.id}`
              }
              {...props}
            />
          )}
          icon={TenancyIcon}
          linkIcon
          badge={
            newlyCreatedId === systemUser.id
              ? { label: t('systemuser_overviewpage.new_system_user'), color: 'info' }
              : undefined
          }
        />
      ))}
    </List>
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
