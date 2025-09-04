interface UserKeyValues {
  OrganizationIdentifier?: string;
  PartyId?: string;
  DateOfBirth?: string;
}

export interface Entity {
  id: string;
  name: string;
  type: string;
  variant: string;
  keyValues: UserKeyValues | null;
}

export interface CompactRole {
  id: string;
  code: string;
  children: CompactRole[];
  roleCodes: string[];
}
