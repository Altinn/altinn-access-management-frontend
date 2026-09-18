import { useMemo } from 'react';

import type { Request } from './types';

import { matchesOrgNr } from '@/resources/utils/reporteeUtils';

export const filterRequests = (
  requests: Request[] | undefined,
  searchString: string,
): Request[] => {
  const list = requests ?? [];
  const normalizedSearch = searchString.trim().toLowerCase();
  if (!normalizedSearch) {
    return list;
  }
  return list.filter(
    (request) =>
      request.displayPartyName.toLowerCase().includes(normalizedSearch) ||
      matchesOrgNr(request.organizationIdentifier, normalizedSearch),
  );
};

export const useFilteredRequests = (
  requests: Request[] | undefined,
  searchString: string,
): Request[] => useMemo(() => filterRequests(requests, searchString), [requests, searchString]);
