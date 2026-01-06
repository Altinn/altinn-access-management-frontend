import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert } from '@altinn/altinn-components';

import classes from './CreateSystemUserCheck.module.css';
import type { ReporteeInfo } from '@/rtk/features/userInfoApi';
import { hasCreateSystemUserPermission } from '@/resources/utils/permissionUtils';

interface CreateSystemUserCheckProps {
  reporteeData: ReporteeInfo | undefined;
  isAdmin: boolean | undefined;
  children: React.ReactNode;
}
export const CreateSystemUserCheck = ({
  reporteeData,
  isAdmin,
  children,
}: CreateSystemUserCheckProps): React.ReactNode => {
  const { t } = useTranslation();

  const canCreate = hasCreateSystemUserPermission(reporteeData, isAdmin);

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
