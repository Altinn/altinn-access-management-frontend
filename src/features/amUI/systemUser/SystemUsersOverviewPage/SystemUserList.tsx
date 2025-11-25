import React, { ReactElement, ReactNode } from 'react';
import { SystemUser } from '../types';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import classes from './SystemUserOverviewPage.module.css';
import { Badge, DsHeading, List, ListItem } from '@altinn/altinn-components';
import { TenancyIcon } from '@navikt/aksel-icons';

interface SystemUserListProps {
  systemUsers: SystemUser[];
  listHeading: string;
  isPendingRequestList?: boolean;
  headerContent?: ReactNode;
}
export const SystemUserList = ({
  systemUsers,
  isPendingRequestList,
  listHeading,
  headerContent,
}: SystemUserListProps) => {
  const { t } = useTranslation();
  const routerLocation = useLocation();

  const newlyCreatedId = routerLocation?.state?.createdId;

  return (
    <>
      <div className={classes.listHeader}>
        {systemUsers.length > 0 && (
          <DsHeading
            level={2}
            data-size='xs'
            className={classes.systemUserHeader}
          >
            {listHeading}
          </DsHeading>
        )}
        {headerContent}
      </div>
      <List>
        {systemUsers?.map((systemUser) => {
          let href: string = '';
          if (systemUser.userType === 'standard' && !isPendingRequestList) {
            href = `/systemuser/${systemUser.id}`;
          } else if (systemUser.userType === 'agent' && !isPendingRequestList) {
            href = `/systemuser/${systemUser.id}/agentdelegation`;
          } else if (systemUser.userType === 'standard' && isPendingRequestList) {
            href = `/systemuser/request?id=${systemUser.id}&skiplogout=true`;
          } else if (systemUser.userType === 'agent' && isPendingRequestList) {
            href = `/systemuser/agentrequest?id=${systemUser.id}&skiplogout=true`;
          }

          let badgeContent: ReactElement | string | undefined = undefined;
          if (isPendingRequestList && systemUser.userType === 'standard') {
            badgeContent = t('systemuser_overviewpage.pending_request_badge');
          } else if (isPendingRequestList && systemUser.userType === 'agent') {
            badgeContent = t('systemuser_overviewpage.pending_agent_request_badge');
          } else if (!isPendingRequestList && systemUser.userType === 'standard') {
            badgeContent = t('systemuser_overviewpage.standard_system_user_badge');
          } else if (!isPendingRequestList && systemUser.userType === 'agent') {
            badgeContent = t('systemuser_overviewpage.agent_system_user_badge');
          }

          const badge = (
            <div className={classes.systemUserBadge}>
              {newlyCreatedId == systemUser.id && (
                <Badge
                  label={t('systemuser_overviewpage.new_system_user')}
                  color='info'
                />
              )}
              {badgeContent}
            </div>
          );

          const refText =
            isPendingRequestList &&
            (systemUser.userType === 'standard' || systemUser.userType === 'agent')
              ? `(ref: ${systemUser.id.slice(-5)})`
              : '';

          return (
            <ListItem
              key={systemUser.id}
              size='lg'
              title={{ children: `${systemUser.integrationTitle} ${refText}`, as: 'h3' }}
              description={systemUser.system.systemVendorOrgName}
              as={(props) => (
                <Link
                  to={href}
                  {...props}
                />
              )}
              icon={TenancyIcon}
              linkIcon
              badge={badge}
            />
          );
        })}
      </List>
    </>
  );
};
