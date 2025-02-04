import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

export interface RegisteredSystem {
  systemId: string;
  systemVendorOrgNumber: string;
  systemVendorOrgName: string;
  name: string;
}

export interface ProblemDetail {
  code: string;
  detail: string;
  status: number;
  title: string;
  type: string;
}

export interface SystemUser {
  id: string;
  integrationTitle: string;
  created: string;
  system: RegisteredSystem;
  resources: ServiceResource[];
  accessPackages: SysteUserAccessPackage[];
}

type RequestStatus = 'New' | 'Accepted' | 'Rejected' | 'Denied' | 'Timedout';

export interface SystemUserRequest {
  id: string;
  status: RequestStatus;
  redirectUrl?: string;
  system: RegisteredSystem;
  resources: ServiceResource[];
  accessPackages: SysteUserAccessPackage[];
}

export interface SystemUserChangeRequest {
  id: string;
  status: RequestStatus;
  redirectUrl?: string;
  system: RegisteredSystem;
  resources: ServiceResource[];
  accessPackages: SysteUserAccessPackage[];
}

// TODO: temp? type for access package with enriched resources
export interface SysteUserAccessPackage extends Omit<AccessPackage, 'resources'> {
  resources: ServiceResource[];
}
