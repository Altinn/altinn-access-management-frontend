export interface BaseResource {
  identifier: string;
  title: string;
  description?: string;
  resourceType?: string;
  resourceOwnerName: string;
  resourceOwnerLogoUrl: string;
  resourceOwnerOrgcode: string;
  resourceOwnerOrgNumber: string;
}
