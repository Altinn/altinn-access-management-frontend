import { useMemo } from 'react';

interface UseFilteredResourcesProps<TResource> {
  resources?: TResource[];
  searchString: string;
  serviceOwnerFilter?: string[];
  getResourceName: (resource: TResource) => string;
  getOwnerName: (resource: TResource) => string;
  getOwnerOrgCode: (resource: TResource) => string;
  getDescription?: (resource: TResource) => string;
}

export const useFilteredResources = <TResource>({
  resources,
  searchString,
  serviceOwnerFilter,
  getResourceName,
  getOwnerName,
  getOwnerOrgCode,
  getDescription,
}: UseFilteredResourcesProps<TResource>) => {
  const normalizedSearch = searchString.trim().toLowerCase();

  const filteredResources = useMemo(() => {
    const list = resources ?? [];
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
      return (
        (nameOrTitle.includes(normalizedSearch) ||
          ownerName.includes(normalizedSearch) ||
          description.includes(normalizedSearch)) &&
        serviceOwnerMatch
      );
    });
  }, [
    resources,
    normalizedSearch,
    serviceOwnerFilter,
    getDescription,
    getOwnerName,
    getResourceName,
  ]);

  return {
    resources: filteredResources,
    totalFilteredCount: filteredResources.length,
  };
};
