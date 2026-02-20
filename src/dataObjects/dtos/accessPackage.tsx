import type { CompactRole, Entity } from './Common';

export interface Reason {
  items: ReasonItem[];
}

export interface ReasonItem {
  name: string;
  description: string;
}
export interface Permissions {
  to: Entity;
  from: Entity;
  via: Entity;
  role: CompactRole | null;
  viaRole: CompactRole | null;
  reason: Reason;
}

export interface CompactPackage {
  id: string;
  urn: string;
  areaId: string;
}
