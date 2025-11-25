import { ReporteeInfo } from '@/rtk/features/userInfoApi';

export const isOrganization = (reportee?: ReporteeInfo): boolean => {
  return reportee?.type === 'Organization';
};

export const isSubUnit = (reportee?: ReporteeInfo): boolean => {
  return (
    isOrganization(reportee) && (reportee?.unitType === 'BEDR' || reportee?.unitType === 'AAFY')
  );
};

export const isSubUnitByType = (unitType?: string): boolean => {
  return unitType === 'BEDR' || unitType === 'AAFY';
};

export const formatOrgNr = (orgNo?: string): string | undefined => {
  return orgNo?.match(/.{1,3}/g)?.join(' ');
};
