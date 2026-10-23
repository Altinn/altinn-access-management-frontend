/** The kind of party, as sent by the BFF (PartyTypeFE). Subunits are Organization with a subunit unitType. */
export enum PartyType {
  Person = 'Person',
  Organization = 'Organization',
  SystemUser = 'SystemUser',
  SelfIdentified = 'SelfIdentified',
}

/** A person, organization or system user, as sent by the BFF (PartyFE). Use isSubUnitByType(unitType) to detect subunits. */
export interface PartyEntity {
  id: string;
  partyId?: number | null;
  name: string;
  type: PartyType;
  unitType?: string | null;
  organizationIdentifier?: string | null;
  dateOfBirth?: string | null;
  isDeleted: boolean;
  children?: PartyEntity[] | null;
  /** The main unit, for a subunit */
  parent?: PartyEntity | null;
}

/** A party the user can act on behalf of, as sent by the BFF (AuthorizedPartyFE). */
export interface AuthorizedPartyEntity extends Omit<PartyEntity, 'children'> {
  authorizedResources: string[];
  authorizedRoles: string[];
  onlyHierarchyElementWithNoAccess: boolean;
  children?: AuthorizedPartyEntity[] | null;
}
