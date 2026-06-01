import { ReporteeInfo } from '@/rtk/features/userInfoApi';
import { formatDate } from '@altinn/altinn-components';
import { t } from 'i18next';

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

export const formatOrgNr = (orgNo?: string | null): string | undefined => {
  return orgNo?.match(/.{1,3}/g)?.join(' ');
};

export const getFormattedDateOfBirthLabel = (dateOfBirth?: string | null): string => {
  if (!dateOfBirth) {
    return '';
  }
  return `${t('common.date_of_birth')} ${formatDate(dateOfBirth)}`;
};
