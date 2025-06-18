export interface Entity {
  id: string;
  name: string;
  type: string;
  variant: string;
}

export interface CompactRole {
  id: string;
  code: string;
  children: CompactRole[];
}
