import type { PackageResource } from '@/rtk/features/accessPackageApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

export type ResourceListItemResource =
  | PackageResource
  | ServiceResource
  | (Record<string, unknown> & {
      id?: string;
      identifier?: string;
      title?: string;
      name?: string;
      description?: string;
      provider?: {
        name?: string;
        code?: string;
        logoUrl?: string;
      };
      resourceOwnerName?: string;
      resourceOwnerLogoUrl?: string;
      resourceOwnerOrgcode?: string;
      resourceOwnerOrgNumber?: string;
    });
