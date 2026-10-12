import { formatDate, formatDisplayName } from '@altinn/altinn-components';
import { t } from 'i18next';

import { PartyType, type PartyEntity } from '@/dataObjects/dtos/Party';
import { type UserListItemData } from '@/features/amUI/common/UserListItems/UserListItems';

const SUBUNIT_TYPES = ['BEDR', 'AAFY', 'ADOS'];

/** The parts of a PartyEntity or UserListItemData needed to format its name. */
type NamedEntity = Pick<PartyEntity | UserListItemData, 'name' | 'type'>;
/** Anything that may carry a party type. */
type TypedEntity = Partial<Pick<NamedEntity, 'type'>>;

export const isOrganization = (entity: TypedEntity | null | undefined): boolean => {
  return entity?.type === PartyType.Organization;
};

export const isSystemUser = (entity: TypedEntity | null | undefined): boolean => {
  return entity?.type === PartyType.SystemUser;
};

export const isSubUnitByType = (unitType?: string | null): boolean => {
  return !!unitType && SUBUNIT_TYPES.includes(unitType);
};

export const isSubUnit = (
  entity: Partial<Pick<PartyEntity, 'type' | 'unitType'>> | null | undefined,
): boolean => {
  return isOrganization(entity) && isSubUnitByType(entity?.unitType);
};

/** Formats the name of a PartyEntity or UserListItemData with formatDisplayName. */
export const formatEntityDisplayName = (
  entity: NamedEntity | null | undefined,
  reverseNameOrder?: boolean,
): string => {
  if (entity && isSystemUser(entity)) {
    return entity.name; // do not format system user name
  }
  return entity
    ? formatDisplayName({
        fullName: entity.name ?? '',
        type: isOrganization(entity) ? 'company' : 'person',
        reverseNameOrder,
      })
    : '';
};

/** The avatar type for a party. Persons and self-identified users are 'person'. */
export const getAvatarType = (
  entity: TypedEntity | null | undefined,
): 'person' | 'company' | 'system' => {
  if (isOrganization(entity)) {
    return 'company';
  } else if (isSystemUser(entity)) {
    return 'system';
  }
  return 'person';
};

/** The theme color for a party. System users have no color of their own and use the company color. */
export const getPartyColor = (entity: TypedEntity | null | undefined): 'person' | 'company' =>
  getAvatarType(entity) === 'person' ? 'person' : 'company';

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
