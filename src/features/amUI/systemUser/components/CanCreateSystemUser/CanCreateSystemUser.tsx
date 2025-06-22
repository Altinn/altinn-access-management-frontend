import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsParagraph } from '@altinn/altinn-components';

import { type ReporteeInfo } from '@/rtk/features/userInfoApi';

import classes from './CanCreateSystemUser.module.css';

interface CreateSystemUserCheckProps {
  reporteeData: ReporteeInfo | undefined;
  children: React.ReactNode;
}

const canCreateSystemUser = (reporteeInfo: ReporteeInfo): boolean => {
  const isOrganization = reporteeInfo.type === 'Organization';
  const hasCorrectRole = reporteeInfo.authorizedRoles.some((role) =>
    ['DAGL', 'HADM', 'ADMAI'].includes(role),
  );
  return isOrganization && hasCorrectRole;
};

export const CreateSystemUserCheck = ({
  reporteeData,
  children,
}: CreateSystemUserCheckProps): React.ReactNode => {
  const { t } = useTranslation();

  return (
    <>
      {reporteeData && !canCreateSystemUser(reporteeData) && (
        <DsParagraph className={classes.noRightsParagraph}>
          <span className={classes.noRightsParagraphBold}>
            {t('systemuser_overviewpage.no_key_role1')}{' '}
          </span>
          {t('systemuser_overviewpage.no_key_role2')}
        </DsParagraph>
      )}
      {reporteeData && canCreateSystemUser(reporteeData) && children}
    </>
  );
};
