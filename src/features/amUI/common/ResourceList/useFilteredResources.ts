import { useEffect, useMemo, useState } from 'react';

interface UseFilteredResourcesProps<TResource> {
  resources?: TResource[];
  searchString: string;
  getResourceName: (resource: TResource) => string;
  getOwnerName: (resource: TResource) => string;
  getDescription?: (resource: TResource) => string;
}

export const useFilteredResources = <TResource>({
  resources,
  searchString,
  getResourceName,
  getOwnerName,
  getDescription,
}: UseFilteredResourcesProps<TResource>) => {
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const normalizedSearch = searchString.trim().toLowerCase();

  const filteredResources = useMemo(() => {
    const list = resources ?? [];
    if (!normalizedSearch) return list;
    return list.filter((resource) => {
      const nameOrTitle = getResourceName(resource).toLowerCase();
      const ownerName = getOwnerName(resource).toLowerCase();
      const description = getDescription?.(resource)?.toLowerCase() ?? '';
      return (
        nameOrTitle.includes(normalizedSearch) ||
        ownerName.includes(normalizedSearch) ||
        description.includes(normalizedSearch)
      );
    });
  }, [resources, normalizedSearch, getDescription, getOwnerName, getResourceName]);

  useEffect(() => {
    setCurrentPage(1);
  }, [resources, searchString]);

  const paginatedResources = useMemo(() => {
    return filteredResources.slice(0, PAGE_SIZE * currentPage);
  }, [filteredResources, currentPage]);

  const hasNextPage = filteredResources.length > PAGE_SIZE * currentPage;

  const loadNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return {
    resources: paginatedResources,
    hasNextPage,
    loadNextPage,
    totalFilteredCount: filteredResources.length,
  };
};
