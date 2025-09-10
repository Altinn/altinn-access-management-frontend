import { useMemo } from 'react';

import type { PackageResource } from '@/rtk/features/accessPackageApi';

interface UseFilteredResourcesProps {
  resources?: PackageResource[];
  searchString: string;
}

export const useFilteredResources = ({ resources, searchString }: UseFilteredResourcesProps) => {
  const normalizedSearch = searchString.trim().toLowerCase();

  const filteredResources = useMemo(() => {
    const list = resources ?? [];
    if (!normalizedSearch) return list;
    return list.filter((r) => {
      const title = (r.title || '').toLowerCase();
      const ownerName = (r.provider?.name || r.resourceOwnerName || '').toLowerCase();
      const description = (r.description || '').toLowerCase();
      return (
        title.includes(normalizedSearch) ||
        ownerName.includes(normalizedSearch) ||
        description.includes(normalizedSearch)
      );
    });
  }, [resources, normalizedSearch]);

  return { resources: filteredResources };
};
