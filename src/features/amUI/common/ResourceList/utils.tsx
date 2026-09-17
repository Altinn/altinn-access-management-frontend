import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

/**
 * Altinn 2 services that have been migrated, and resources the service owner has deprecated,
 * are still returned by search but should be marked as expired.
 */
export const isExpiredResource = (resource: ServiceResource): boolean =>
  resource.resourceType === 'MigratedApp' || resource.status?.toLowerCase() === 'deprecated';
