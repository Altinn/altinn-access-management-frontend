import type { ReporteeInfo } from '@/rtk/features/userInfoApi';

export const canCreateSystemUser = (reporteeInfo?: ReporteeInfo): boolean | undefined => {
  if (!reporteeInfo) {
    return undefined;
  }
  const isOrganization = reporteeInfo.type === 'Organization';
  const hasCorrectRole = reporteeInfo.authorizedRoles.some((role) =>
    ['DAGL', 'HADM', 'ADMAI'].includes(role),
  );
  return isOrganization && hasCorrectRole;
};
