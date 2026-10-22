import { PartyType, type AuthorizedPartyEntity } from '@/dataObjects/dtos/Party';

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
  const isOrganization = reporteeInfo.type === PartyType.Organization;
  return isOrganization && isAdmin;
};

export const hasSystemUserClientAdminPermission = (
  reporteeInfo?: AuthorizedPartyEntity,
  isClientAdmin: boolean = false,
): boolean | undefined => {
  if (!reporteeInfo) {
    return undefined;
  }

  const isOrganization = reporteeInfo.type === PartyType.Organization;
  return isOrganization && isClientAdmin;
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
