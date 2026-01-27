export interface Entity {
  id: string;
  name: string;
  type: string;
  variant: string;
  parent?: Entity | null;
  partyId?: number | string | null;
  organizationIdentifier?: string | null;
  dateOfBirth?: string | null;
  isDeleted?: boolean | null;
  children?: Entity[] | null;
}

export interface CompactRole {
  id: string;
  code: string;
  children: CompactRole[];
  roleCodes: string[];
}
