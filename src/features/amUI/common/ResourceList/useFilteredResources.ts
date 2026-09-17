import { useMemo } from 'react';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import { isExpiredResource } from './utils';

interface UseFilteredResourcesProps {
  resources?: ServiceResource[];
  searchString: string;
  serviceOwnerFilter?: string[];
  includeExpiredResources?: boolean;
  /** Extra text to match the search against, e.g. the scope references of a maskinporten resource */
  additionalSearchText?: (resource: ServiceResource) => string;
}

export const useFilteredResources = ({
  resources,
  searchString,
  serviceOwnerFilter,
  includeExpiredResources,
  additionalSearchText,
}: UseFilteredResourcesProps) => {
  const normalizedSearch = searchString.trim().toLowerCase();

  const filteredResources = useMemo(() => {
    let list = resources ?? [];
    if (!includeExpiredResources) {
      list = list.filter((resource) => !isExpiredResource(resource));
    }

    if (!normalizedSearch && !serviceOwnerFilter) {
      return list;
    }

    return list.filter((resource) => {
      const serviceOwnerMatch =
        serviceOwnerFilter && serviceOwnerFilter.length > 0
          ? serviceOwnerFilter
              .map((owner) => owner.toLowerCase())
              .includes(resource.resourceOwnerOrgcode.toLowerCase())
          : true;

      const matchesSearch = [
        resource.title,
        resource.resourceOwnerName,
        resource.description,
        additionalSearchText?.(resource),
      ]
        .filter(Boolean)
        .some((field) => field?.toLowerCase().includes(normalizedSearch));

      return matchesSearch && serviceOwnerMatch;
    });
  }, [
    resources,
    normalizedSearch,
    serviceOwnerFilter,
    includeExpiredResources,
    additionalSearchText,
  ]);

  return {
    resources: filteredResources,
    totalFilteredCount: filteredResources.length,
  };
};
