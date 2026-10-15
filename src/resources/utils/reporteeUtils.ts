import { formatDate, formatDisplayName } from '@altinn/altinn-components';
import { t } from 'i18next';

import { PartyType, type AuthorizedPartyEntity, type PartyEntity } from '@/dataObjects/dtos/Party';
import { type UserListItemData } from '@/features/amUI/common/UserListItems/UserListItems';

const SUBUNIT_TYPES = ['BEDR', 'AAFY', 'ADOS'];

export const isOrganization = (reportee?: AuthorizedPartyEntity): boolean => {
  return reportee?.type === PartyType.Organization;
};

export const isSubUnitByType = (unitType?: string | null): boolean => {
  return !!unitType && SUBUNIT_TYPES.includes(unitType);
};

export const isSubUnit = (reportee?: AuthorizedPartyEntity): boolean => {
  return isOrganization(reportee) && isSubUnitByType(reportee?.unitType);
};

/** The parts of a PartyEntity or UserListItemData needed to format its name. */
type NamedEntity = Pick<PartyEntity | UserListItemData, 'name' | 'type'>;

const isOrganizationEntity = (entity: NamedEntity): boolean =>
  entity.type === PartyType.Organization;

const isSystemuserEntity = (entity: NamedEntity): boolean => entity.type === PartyType.SystemUser;

/** Formats the name of a PartyEntity or UserListItemData with formatDisplayName. */
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
