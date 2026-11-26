import { useMemo } from 'react';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import { isExpiredResource } from './utils';

interface UseFilteredResourcesProps<TResource extends ServiceResource> {
  resources?: TResource[];
  searchString: string;
  serviceOwnerFilter?: string[];
  includeExpiredResources?: boolean;
  /** Text matched by the default search besides title and owner. Defaults to the description. */
  getDescription?: (resource: TResource) => string;
  /** Replaces the default search, which matches the whole search string on title, owner and description. */
  matchesSearch?: (resource: TResource, normalizedSearch: string) => boolean;
}

export const useFilteredResources = <TResource extends ServiceResource>({
  resources,
  searchString,
  serviceOwnerFilter,
  includeExpiredResources,
  getDescription,
  matchesSearch,
}: UseFilteredResourcesProps<TResource>) => {
  const normalizedSearch = searchString.trim().toLowerCase();

  const filteredResources = useMemo(() => {
    let list = resources ?? [];
    if (!includeExpiredResources) {
      list = list.filter((x) => !isExpiredResource(x));
    }
    if (!normalizedSearch && !serviceOwnerFilter) return list;
    const owners = serviceOwnerFilter?.map((owner) => owner.toLowerCase()) ?? [];
    return list.filter((resource) => {
      const serviceOwnerMatch =
        owners.length === 0 || owners.includes(resource.resourceOwnerOrgcode?.toLowerCase() ?? '');
      const searchMatch = !normalizedSearch
        ? true
        : matchesSearch
          ? matchesSearch(resource, normalizedSearch)
          : [
              resource.title,
              resource.resourceOwnerName,
              getDescription ? getDescription(resource) : resource.description,
            ].some((field) => field?.toLowerCase().includes(normalizedSearch));
      return searchMatch && serviceOwnerMatch;
    });
  }, [
    resources,
    normalizedSearch,
    serviceOwnerFilter,
    includeExpiredResources,
    getDescription,
    matchesSearch,
  ]);

  return {
    resources: filteredResources,
    totalFilteredCount: filteredResources.length,
  };
};
