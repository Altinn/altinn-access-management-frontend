import { ReporteeInfo } from '@/rtk/features/userInfoApi';

export const hasConsentPermission = (isAdmin: boolean = false): boolean => {
  return isAdmin;
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
