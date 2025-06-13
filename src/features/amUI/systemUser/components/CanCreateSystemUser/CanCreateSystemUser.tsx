import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsSpinner, DsParagraph } from '@altinn/altinn-components';

import { type ReporteeInfo } from '@/rtk/features/userInfoApi';
import { useGetSystemUserReporteeQuery } from '@/rtk/features/systemUserApi';

import classes from './CanCreateSystemUser.module.css';

interface CreateSystemUserCheckProps {
  partyId: string;
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
  partyId,
  children,
}: CreateSystemUserCheckProps): React.ReactNode => {
  const { t } = useTranslation();

  const { data: reporteeData, isLoading: isLoadingReporteeData } =
    useGetSystemUserReporteeQuery(partyId);

  return (
    <>
      {isLoadingReporteeData && <DsSpinner aria-label='' />}
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
