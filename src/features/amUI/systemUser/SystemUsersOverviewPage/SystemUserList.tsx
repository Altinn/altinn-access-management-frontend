import React, { ReactElement, ReactNode } from 'react';
import { SystemUser } from '../types';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import classes from './SystemUserOverviewPage.module.css';
import { BadgeProps, DsHeading, List, ListItem } from '@altinn/altinn-components';
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
          if (systemUser.systemUserType === 'Standard' && !isPendingRequestList) {
            href = `/systemuser/${systemUser.id}`;
          } else if (systemUser.systemUserType === 'Agent' && !isPendingRequestList) {
            href = `/systemuser/${systemUser.id}/agentdelegation`;
          } else if (systemUser.systemUserType === 'Standard' && isPendingRequestList) {
            href = `/systemuser/request?id=${systemUser.id}/`;
          } else if (systemUser.systemUserType === 'Agent' && isPendingRequestList) {
            href = `/systemuser/agentrequest?id=${systemUser.id}/`;
          }

          let badge: BadgeProps | ReactElement | undefined = undefined;
          if (isPendingRequestList && systemUser.systemUserType === 'Standard') {
            badge = (
              <div className={classes.systemUserBadge}>
                {t('systemuser_overviewpage.pending_request_badge')}
              </div>
            );
          } else if (isPendingRequestList && systemUser.systemUserType === 'Agent') {
            badge = (
              <div className={classes.systemUserBadge}>
                {t('systemuser_overviewpage.pending_agent_request_badge')}
              </div>
            );
          } else if (newlyCreatedId === systemUser.id) {
            badge = { label: t('systemuser_overviewpage.new_system_user'), color: 'info' };
          }

          return (
            <ListItem
              key={systemUser.id}
              size='lg'
              title={{ children: systemUser.integrationTitle, as: 'h3' }}
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
