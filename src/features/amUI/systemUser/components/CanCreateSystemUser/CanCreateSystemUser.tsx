import React from 'react';
import { Paragraph, Spinner } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';

import { useGetReporteeQuery, type ReporteeInfo } from '@/rtk/features/userInfoApi';

import classes from './CanCreateSystemUser.module.css';

interface CreateSystemUserCheckProps {
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
  children,
}: CreateSystemUserCheckProps): React.ReactNode => {
  const { t } = useTranslation();

  const { data: reporteeData, isLoading: isLoadingReporteeData } = useGetReporteeQuery();

  return (
    <>
      {isLoadingReporteeData && <Spinner aria-label='' />}
      {reporteeData && !canCreateSystemUser(reporteeData) && (
        <Paragraph className={classes.noRightsParagraph}>
          <span className={classes.noRightsParagraphBold}>
            {t('systemuser_overviewpage.no_key_role1')}{' '}
          </span>
          {t('systemuser_overviewpage.no_key_role2')}
        </Paragraph>
      )}
      {reporteeData && canCreateSystemUser(reporteeData) && children}
    </>
  );
};
