import type { CompactRole } from './Common';
import type { PartyEntity } from './Party';

export interface Reason {
  items: ReasonItem[];
}

export interface ReasonItem {
  name: string;
  description: string;
}
export interface Permissions {
  to: PartyEntity;
  from: PartyEntity;
  via: PartyEntity | null;
  role: CompactRole | null;
  viaRole: CompactRole | null;
  reason: Reason;
}

export interface CompactPackage {
  id: string;
  urn: string;
  areaId: string;
}
