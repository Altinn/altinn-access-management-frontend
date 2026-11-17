import { useMemo } from 'react';

interface UseFilteredResourcesProps<TResource> {
  resources?: TResource[];
  searchString: string;
  serviceOwnerFilter?: string[];
  includeExpiredResources?: boolean;
  getResourceName: (resource: TResource) => string;
  getOwnerName: (resource: TResource) => string;
  getOwnerOrgCode: (resource: TResource) => string;
  getDescription?: (resource: TResource) => string;
  isExpiredResource?: (resource: TResource) => boolean;
  matchesSearch?: (resource: TResource, normalizedSearch: string) => boolean;
}

export const useFilteredResources = <TResource>({
  resources,
  searchString,
  serviceOwnerFilter,
  includeExpiredResources,
  getResourceName,
  getOwnerName,
  getOwnerOrgCode,
  getDescription,
  isExpiredResource,
  matchesSearch,
}: UseFilteredResourcesProps<TResource>) => {
  const normalizedSearch = searchString.trim().toLowerCase();

  const filteredResources = useMemo(() => {
    let list = resources ?? [];
    if (!includeExpiredResources && isExpiredResource) {
      list = list.filter((x) => !isExpiredResource(x));
    }
    if (!normalizedSearch && !serviceOwnerFilter) return list;
    return list.filter((resource) => {
      const nameOrTitle = getResourceName(resource).toLowerCase();
      const ownerName = getOwnerName(resource).toLowerCase();
      const description = getDescription?.(resource)?.toLowerCase() ?? '';
      const serviceOwnerMatch =
        serviceOwnerFilter && serviceOwnerFilter.length > 0
          ? serviceOwnerFilter
              .map((owner) => owner.toLowerCase())
              .includes(getOwnerOrgCode(resource).toLowerCase())
          : true;
      const searchMatch = matchesSearch
        ? matchesSearch(resource, normalizedSearch)
        : nameOrTitle.includes(normalizedSearch) ||
          ownerName.includes(normalizedSearch) ||
          description.includes(normalizedSearch);
      return searchMatch && serviceOwnerMatch;
    });
  }, [
    resources,
    normalizedSearch,
    serviceOwnerFilter,
    includeExpiredResources,
    getDescription,
    getOwnerName,
    getResourceName,
    matchesSearch,
  ]);

  return {
    resources: filteredResources,
    totalFilteredCount: filteredResources.length,
  };
};
