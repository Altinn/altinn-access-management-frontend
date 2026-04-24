import { useMemo } from 'react';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

interface UseFilteredResourcesProps {
  resources?: ServiceResource[];
  searchString: string;
  serviceOwnerFilter?: string[];
}

export const useFilteredResources = ({
  resources,
  searchString,
  serviceOwnerFilter,
}: UseFilteredResourcesProps) => {
  const normalizedSearch = searchString.trim().toLowerCase();

  const filteredResources = useMemo(() => {
    const list = resources ?? [];
    if (!normalizedSearch && !serviceOwnerFilter) return list;
    return list.filter((resource) => {
      const title = resource.title?.toLowerCase() ?? '';
      const ownerName = resource.resourceOwnerName?.toLowerCase() ?? '';
      const description = resource.description?.toLowerCase() ?? '';
      const serviceOwnerMatch =
        serviceOwnerFilter && serviceOwnerFilter.length > 0
          ? serviceOwnerFilter
              .map((owner) => owner.toLowerCase())
              .includes(resource.resourceOwnerOrgcode.toLowerCase())
          : true;
      return (
        (title.includes(normalizedSearch) ||
          ownerName.includes(normalizedSearch) ||
          description.includes(normalizedSearch)) &&
        serviceOwnerMatch
      );
    });
  }, [resources, normalizedSearch, serviceOwnerFilter]);

  return {
    resources: filteredResources,
    totalFilteredCount: filteredResources.length,
  };
};
