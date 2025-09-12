import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert } from '@altinn/altinn-components';

import classes from './CanCreateSystemUser.module.css';
import type { ReporteeInfo } from '@/rtk/features/userInfoApi';
import { canCreateSystemUser } from '../../permissionUtils';

interface CreateSystemUserCheckProps {
  reporteeData: ReporteeInfo | undefined;
  children: React.ReactNode;
}
export const CreateSystemUserCheck = ({
  reporteeData,
  children,
}: CreateSystemUserCheckProps): React.ReactNode => {
  const { t } = useTranslation();

  const canCreate = canCreateSystemUser(reporteeData);

  return (
    <>
      {reporteeData && canCreate === false && (
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
      {reporteeData && canCreate && children}
    </>
  );
};
