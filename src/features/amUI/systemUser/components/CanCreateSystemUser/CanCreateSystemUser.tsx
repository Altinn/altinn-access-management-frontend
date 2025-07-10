import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert } from '@altinn/altinn-components';

import classes from './CanCreateSystemUser.module.css';

interface CreateSystemUserCheckProps {
  canCreateSystemUser?: boolean;
  children: React.ReactNode;
}
export const CreateSystemUserCheck = ({
  canCreateSystemUser,
  children,
}: CreateSystemUserCheckProps): React.ReactNode => {
  const { t } = useTranslation();

  return (
    <>
      {!canCreateSystemUser && (
        <DsAlert
          data-color='warning'
          className={classes.noRightsAlert}
        >
          <span className={classes.noRightsAlertBold}>
            {t('systemuser_overviewpage.no_key_role1')}{' '}
          </span>
          {t('systemuser_overviewpage.no_key_role2')}
        </DsAlert>
      )}
      {canCreateSystemUser && children}
    </>
  );
};
