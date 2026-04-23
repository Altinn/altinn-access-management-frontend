import type { PackageResource } from '@/rtk/features/accessPackageApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

export type ResourceListItemResource = ServiceResource | PackageResource;
