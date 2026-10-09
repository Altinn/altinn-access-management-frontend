import { formatDate, formatDisplayName } from '@altinn/altinn-components';
import { t } from 'i18next';

import type { Entity } from '@/dataObjects/dtos/Common';
import type { Party } from '@/rtk/features/lookupApi';
import { PartyType, type ReporteeInfo, type User } from '@/rtk/features/userInfoApi';
import { type UserListItemData } from '@/features/amUI/common/UserListItems/UserListItems';

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
  | Pick<Party, 'name' | 'partyTypeName'>
  | Pick<User | ReporteeInfo | Entity | UserListItemData, 'name' | 'type'>;

const isOrganizationEntity = (entity: NamedEntity): boolean =>
  'partyTypeName' in entity
    ? entity.partyTypeName === PartyType.Organization
    : entity.type?.toLowerCase() === 'organization' ||
      entity.type?.toLowerCase() === 'organisasjon';

const isSystemuserEntity = (entity: NamedEntity): boolean =>
  'partyTypeName' in entity
    ? entity.partyTypeName === PartyType.Systemuser
    : entity.type?.toLowerCase() === 'systemuser' || entity.type?.toLowerCase() === 'systembruker';

/** Formats the name of a Party, User, ReporteeInfo, UserListItemData or Entity with formatDisplayName. */
export const formatEntityDisplayName = (
  entity: NamedEntity | null | undefined,
  reverseNameOrder?: boolean,
): string => {
  if (entity && isSystemuserEntity(entity)) {
    return entity.name; // do not format system user name
  }
  return entity
    ? formatDisplayName({
        fullName: entity.name ?? '',
        type: isOrganizationEntity(entity) ? 'company' : 'person',
        reverseNameOrder,
      })
    : '';
};

export const getAvatarType = (
  entity: NamedEntity | null | undefined,
): 'person' | 'company' | 'system' => {
  if (entity && isOrganizationEntity(entity)) {
    return 'company';
  } else if (entity && isSystemuserEntity(entity)) {
    return 'system';
  }
  return 'person';
};

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
