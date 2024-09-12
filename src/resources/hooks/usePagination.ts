import { useState } from 'react';

import { getArrayPage, getTotalNumOfPages } from '../utils/arrayUtils';

interface PaginationHook<T> {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  paginatedData: T[];
  goToPage: (page: number) => void;
}

function usePagination<T>(data: T[], itemsPerPage: number): PaginationHook<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = getTotalNumOfPages(data, itemsPerPage);
  const paginatedData = getArrayPage(data, currentPage, itemsPerPage);

  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedData,
    goToPage,
  };
}

export default usePagination;
