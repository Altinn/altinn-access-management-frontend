import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

// Matches like the BFF resource search (ResourceService.SearchInResourceList).
export const matchesAnySearchWord = (
  resource: ServiceResource,
  normalizedSearch: string,
): boolean => {
  const fields = [
    resource.title,
    resource.description,
    resource.rightDescription,
    resource.resourceOwnerName,
    resource.identifier,
    ...(resource.keywords ?? []),
  ];
  return normalizedSearch
    .split(/\s/)
    .filter(Boolean)
    .some((word) => fields.some((field) => field?.toLowerCase().includes(word)));
};

export const isExpiredResource = (resource: ServiceResource): boolean =>
  resource.resourceType === 'MigratedApp' || resource.status?.toLowerCase() === 'deprecated';
