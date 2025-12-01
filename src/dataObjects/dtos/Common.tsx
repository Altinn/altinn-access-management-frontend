export interface Entity {
  id: string;
  name: string;
  type: string;
  variant: string;
  partyId?: number | string | null;
  organizationIdentifier?: string | null;
  dateOfBirth?: string | null;
  children?: Entity[] | null;
}

export interface CompactRole {
  id: string;
  code: string;
  children: CompactRole[];
  roleCodes: string[];
}
