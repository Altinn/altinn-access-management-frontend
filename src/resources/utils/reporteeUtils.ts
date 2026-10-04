import { formatDate, formatDisplayName } from '@altinn/altinn-components';
import { t } from 'i18next';

import type { Entity } from '@/dataObjects/dtos/Common';
import type { Party } from '@/rtk/features/lookupApi';
import { PartyType, type ReporteeInfo, type User } from '@/rtk/features/userInfoApi';

const SUBUNIT_TYPES = ['BEDR', 'AAFY', 'ADOS'];

export const isOrganization = (reportee?: ReporteeInfo): boolean => {
  return reportee?.type === 'Organization';
};

export const isSubUnitByType = (unitType?: string | null): boolean => {
  return !!unitType && SUBUNIT_TYPES.includes(unitType);
};

export const isSubUnit = (reportee?: ReporteeInfo): boolean => {
  return isOrganization(reportee) && isSubUnitByType(reportee?.unitType);
};

/** The parts of a Party, User, ReporteeInfo, UserListItemData or Entity needed to format its name. */
type NamedEntity =
  Pick<Party, 'name' | 'partyTypeName'> | Pick<User | ReporteeInfo | Entity, 'name' | 'type'>;

const isPersonEntity = (entity: NamedEntity): boolean =>
  'partyTypeName' in entity
    ? entity.partyTypeName === PartyType.Person
    : entity.type?.toLowerCase() === 'person';

/** Formats the name of a Party, User, ReporteeInfo, UserListItemData or Entity with formatDisplayName. */
export const formatEntityDisplayName = (
  entity: NamedEntity | null | undefined,
  options?: { reverseNameOrder?: boolean },
): string =>
  entity
    ? formatDisplayName({
        fullName: entity.name ?? '',
        type: isPersonEntity(entity) ? 'person' : 'company',
        reverseNameOrder: options?.reverseNameOrder,
      })
    : '';

export const formatOrgNr = (orgNo?: string | null): string | undefined => {
  return orgNo?.match(/.{1,3}/g)?.join(' ');
};

const stripWhitespace = (value: string): string => value.replace(/\s/g, '');

export const matchesOrgNr = (orgNo: string | null | undefined, searchString: string): boolean => {
  if (!orgNo) {
    return false;
  }
  return stripWhitespace(orgNo).includes(stripWhitespace(searchString));
};

export const getFormattedDateOfBirthLabel = (dateOfBirth?: string | null): string => {
  if (!dateOfBirth) {
    return '';
  }
  return `${t('common.date_of_birth')} ${formatDate(dateOfBirth)}`;
};
