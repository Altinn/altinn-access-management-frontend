export interface CompactRole {
  id: string;
  code: string;
  children: CompactRole[];
  roleCodes: string[];
  urn?: string;
}
