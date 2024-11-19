import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import * as React from 'react';
import { useState, useEffect } from 'react';

import { useGetOrganizationQuery } from '@/rtk/features/lookupApi';
import type { Organization } from '@/rtk/features/lookupApi';

// This hook searches through a set of provided pool of orgs, returning the ones whose org number matches the provided search string.
// If no match is found and the provided number is exactly 9 digits, it will attempt a lookup for the org in Altinns registry
// If the search string is empty, all orgs are returned
export const useOrgSearch = (
  searchPool: Organization[],
  searchString: string,
): {
  matches: Organization[];
  error: FetchBaseQueryError | SerializedError | undefined;
  isFetching: boolean;
} => {
  const [matches, setMatches] = useState<Organization[]>(searchPool ?? []);
  const [searchError, setSearchError] = useState(false);
  const {
    data: fetchedOrg,
    error,
    isFetching,
  } = useGetOrganizationQuery(searchString, { skip: searchString.length !== 9 });

  useEffect(() => {
    if (!isFetching) {
      if (searchString === '') {
        setMatches(searchPool);
        setSearchError(false);
      } else {
        const searchPoolMatches = searchPool.filter((org: Organization) =>
          org.orgNumber.includes(searchString),
        );

        if (searchPoolMatches.length > 0) {
          setMatches(searchPoolMatches);
          setSearchError(false);
        } else {
          if (searchString.length === 9 && error) {
            // Lookup failed
            setMatches([]);
            setSearchError(true);
          } else if (searchString.length === 9 && fetchedOrg) {
            setMatches([fetchedOrg]);
            setSearchError(false);
          } else {
            // No matching org found
            setMatches([]);
            setSearchError(false);
          }
        }
      }
    }
  }, [fetchedOrg, searchPool, searchError, isFetching, searchString]);

  return { matches, error, isFetching };
};
