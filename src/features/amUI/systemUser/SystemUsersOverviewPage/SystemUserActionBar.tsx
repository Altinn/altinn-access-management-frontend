import React from 'react';
import { useTranslation } from 'react-i18next';
import { ListItem } from '@altinn/altinn-components';

import type { SystemUser } from '../types';

import classes from './SystemUserOverviewPage.module.css';

interface SystemUserActionBarProps {
  systemUser: SystemUser;
  isNew?: boolean;
  onClick: (systemUserId: string) => void;
}

export const SystemUserActionBar = ({
  systemUser,
  isNew,
  onClick,
}: SystemUserActionBarProps): React.ReactNode => {
  const { t } = useTranslation();

  const onActionBarClick = (): void => {
    onClick(systemUser.id);
  };

  return (
    <li
      key={systemUser.id}
      className={classes.systemUserListItem}
    >
      <ListItem
        size='lg'
        title={systemUser.integrationTitle}
        description={systemUser.system.systemVendorOrgName}
        icon='tenancy'
        badge={
          isNew ? { label: t('systemuser_overviewpage.new_system_user'), color: 'info' } : undefined
        }
        linkIcon='chevron-right'
        onClick={onActionBarClick}
      />
    </li>
  );
};
