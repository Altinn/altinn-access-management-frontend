import { useMemo } from 'react';

import type { PackageResource } from '@/rtk/features/accessPackageApi';

interface UseFilteredResourcesProps {
  resources?: PackageResource[];
  searchString: string;
  serviceOwnerFilter?: string;
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
    return list.filter((r) => {
      const nameOrTitle = (r.name || r.title || '').toLowerCase();
      const ownerName = (r.provider?.name || r.resourceOwnerName || '').toLowerCase();
      const description = (r.description || '').toLowerCase();
      const serviceOwnerOrgCode = r.provider?.code || r.resourceOwnerOrgcode || '';
      const serviceOwnerMatch = serviceOwnerFilter
        ? serviceOwnerOrgCode.toLowerCase() === serviceOwnerFilter.toLowerCase()
        : true;
      return (
        (nameOrTitle.includes(normalizedSearch) ||
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
