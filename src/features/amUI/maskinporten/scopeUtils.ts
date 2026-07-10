import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

export const getMaskinportenScopes = (resource: ServiceResource) =>
  resource.resourceReferences?.filter(
    (reference) => reference.referenceType === 'MaskinportenScope' && reference.reference?.trim(),
  ) ?? [];

export const getMaskinportenScopeCount = (resource: ServiceResource) =>
  getMaskinportenScopes(resource).length;
