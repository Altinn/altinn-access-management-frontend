import { useEffect, useMemo, useState } from 'react';

import type { PackageResource } from '@/rtk/features/accessPackageApi';

interface UseFilteredResourcesProps {
  resources?: PackageResource[];
  searchString: string;
}

export const useFilteredResources = ({ resources, searchString }: UseFilteredResourcesProps) => {
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const normalizedSearch = searchString.trim().toLowerCase();

  const filteredResources = useMemo(() => {
    const list = resources ?? [];
    if (!normalizedSearch) return list;
    return list.filter((r) => {
      const nameOrTitle = (r.name || r.title || '').toLowerCase();
      const ownerName = (r.provider?.name || r.resourceOwnerName || '').toLowerCase();
      const description = (r.description || '').toLowerCase();
      return (
        nameOrTitle.includes(normalizedSearch) ||
        ownerName.includes(normalizedSearch) ||
        description.includes(normalizedSearch)
      );
    });
  }, [resources, normalizedSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [resources, searchString]);

  const paginatedResources = useMemo(() => {
    return filteredResources.slice(0, PAGE_SIZE * currentPage);
  }, [filteredResources, currentPage]);

  const hasNextPage = filteredResources.length > PAGE_SIZE * currentPage;

  const goNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return {
    resources: paginatedResources,
    hasNextPage,
    goNextPage,
    totalFilteredCount: filteredResources.length,
  };
};
