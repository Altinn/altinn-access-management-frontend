import React, { ReactElement, ReactNode } from 'react';
import { SystemUser } from '../types';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import classes from './SystemUserOverviewPage.module.css';
import { BadgeProps, DsHeading, List, ListItem } from '@altinn/altinn-components';
import { TenancyIcon } from '@navikt/aksel-icons';

type ListType = 'agent' | 'standard' | 'pendingStandard' | 'pendingAgent';
interface SystemUserListProps {
  systemUsers: SystemUser[];
  listHeading: string;
  listType: ListType;
  headerContent?: ReactNode;
}
export const SystemUserList = ({
  systemUsers,
  listType,
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
          const href = (listType: ListType): string =>
            ({
              agent: `/systemuser/${systemUser.id}/agentdelegation`,
              standard: `/systemuser/${systemUser.id}`,
              pendingStandard: `/systemuser/request?id=${systemUser.id}/`,
              pendingAgent: `/systemuser/agentrequest?id=${systemUser.id}/`,
            })[listType];

          let badge: BadgeProps | ReactElement | undefined = undefined;
          if (listType === 'pendingStandard' || listType === 'pendingAgent') {
            badge = <div className={classes.systemUserBadge}>Godkjenn systemtilgang</div>;
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
                  to={href(listType)}
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
