import type { CompactRole, Entity } from './Common';

export interface Permissions {
  to: Entity;
  from: Entity;
  via: Entity;
  role: CompactRole | null;
  viaRole: CompactRole | null;
  roleCodes: string[];
}

export interface CompactPackage {
  id: string;
  urn: string;
  areaId: string;
}
