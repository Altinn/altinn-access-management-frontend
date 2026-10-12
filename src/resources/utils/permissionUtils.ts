import { PartyType, type AuthorizedPartyEntity } from '@/dataObjects/dtos/Party';
import { isOrganization } from '@/resources/utils/reporteeUtils';

export const hasConsentPermission = (
  reporteeInfo?: AuthorizedPartyEntity,
  isAdmin: boolean = false,
  isCurrentUserReportee: boolean = false,
): boolean => {
  return (
    reporteeInfo?.type !== PartyType.SelfIdentified &&
    hasReporteeListAdminAccess(reporteeInfo, isAdmin, isCurrentUserReportee)
  );
};

export const hasCreateSystemUserPermission = (
  reporteeInfo?: AuthorizedPartyEntity,
  isAdmin: boolean = false,
): boolean | undefined => {
  if (!reporteeInfo) {
    return undefined;
  }
  return isOrganization(reporteeInfo) && isAdmin;
};

export const hasSystemUserClientAdminPermission = (
  reporteeInfo?: AuthorizedPartyEntity,
  isClientAdmin: boolean = false,
): boolean | undefined => {
  if (!reporteeInfo) {
    return undefined;
  }
  return isOrganization(reporteeInfo) && isClientAdmin;
};

export const hasReporteeListAdminAccess = (
  reporteeInfo?: AuthorizedPartyEntity,
  isAdmin: boolean = false,
  isCurrentUserReportee: boolean = false,
): boolean => {
  if (!reporteeInfo) {
    return false;
  }
  const isOrg = reporteeInfo.type === PartyType.Organization;
  if (isOrg) {
    return isAdmin;
  }
  return isCurrentUserReportee;
};
