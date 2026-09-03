import { type ReporteeInfo } from '@/rtk/features/userInfoApi';

export const hasConsentPermission = (
  reporteeInfo?: ReporteeInfo,
  isAdmin: boolean = false,
  isCurrentUserReportee: boolean = false,
): boolean => {
  return hasReporteeListAdminAccess(reporteeInfo, isAdmin, isCurrentUserReportee);
};

export const hasCreateSystemUserPermission = (
  reporteeInfo?: ReporteeInfo,
  isAdmin: boolean = false,
): boolean | undefined => {
  if (!reporteeInfo) {
    return undefined;
  }
  const isOrganization = reporteeInfo.type === 'Organization';
  return isOrganization && isAdmin;
};

export const hasSystemUserClientAdminPermission = (
  reporteeInfo?: ReporteeInfo,
  isClientAdmin: boolean = false,
): boolean | undefined => {
  if (!reporteeInfo) {
    return undefined;
  }

  const isOrganization = reporteeInfo.type === 'Organization';
  return isOrganization && isClientAdmin;
};

export const hasReporteeListAdminAccess = (
  reporteeInfo?: ReporteeInfo,
  isAdmin: boolean = false,
  isCurrentUserReportee: boolean = false,
): boolean => {
  if (!reporteeInfo) {
    return false;
  }
  const isOrg = reporteeInfo.type === 'Organization';
  if (isOrg) {
    return isAdmin;
  }
  return isCurrentUserReportee;
};
