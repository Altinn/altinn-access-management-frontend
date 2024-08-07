import { getTotalNumOfPages, getArrayPage } from '@/resources/utils';
import type { RightHolder } from '@/rtk/features/userInfo/userInfoApi';
import { useGetRightHoldersQuery } from '@/rtk/features/userInfo/userInfoApi';
import { useState, useEffect, useMemo } from 'react';

const isSearchMatch = (searchString: string, rightHolder: RightHolder): boolean => {
  const isNameMatch = rightHolder.name.toLowerCase().indexOf(searchString.toLowerCase()) > -1;
  const isPersonIdMatch = rightHolder.personId === searchString;
  const isOrgNrMatch = rightHolder.organizationNumber === searchString;
  return isNameMatch || isPersonIdMatch || isOrgNrMatch;
};

// Custom sort function to prioritize registryRoles containing "DAGL"
const sortRightHolders = (rightHolders: RightHolder[]): RightHolder[] => {
  const sorted = [...rightHolders].sort((a, b) => {
    const aHasDAGL = a.registryRoles.includes('DAGL');
    const bHasDAGL = b.registryRoles.includes('DAGL');

    if (aHasDAGL && !bHasDAGL) {
      return -1;
    } else if (!aHasDAGL && bHasDAGL) {
      return 1;
    } else {
      return a.name.localeCompare(b.name);
    }
  });
  return sorted;
};

export const sortRightholderList = (list: RightHolder[]): RightHolder[] =>
  sortRightHolders(list).map((rightHolder) => {
    if (rightHolder.inheritingRightHolders) {
      return {
        ...rightHolder,
        inheritingRightHolders: sortRightHolders(rightHolder.inheritingRightHolders),
      };
    }
    return rightHolder;
  });

const computePageEntries = (
  searchString: string,
  currentPage: number,
  pageSize: number,
  rightHolders?: RightHolder[],
) => {
  if (!rightHolders) {
    return {
      pageEntries: [],
      numOfPages: 1,
      searchResultLength: 0,
    };
  }

  const searchResult: RightHolder[] = [];

  rightHolders.forEach((rightHolder) => {
    if (isSearchMatch(searchString, rightHolder)) {
      searchResult.push(rightHolder);
    } else if (rightHolder.inheritingRightHolders?.length > 0) {
      // check for searchString matches in inheritingRightHolders
      const matchingInheritingItems = rightHolder.inheritingRightHolders.filter(
        (inheritRightHolder) => isSearchMatch(searchString, inheritRightHolder),
      );
      if (matchingInheritingItems.length > 0) {
        searchResult.push({
          ...rightHolder,
          inheritingRightHolders: matchingInheritingItems,
        });
      }
    }
  });

  return {
    pageEntries: getArrayPage(searchResult, currentPage, pageSize),
    numOfPages: getTotalNumOfPages(searchResult, pageSize),
    searchResultLength: searchResult.length,
  };
};

export const useFilteredRightHolders = (
  searchString: string,
  currentPage: number,
  pageSize: number,
) => {
  const { data: rightHolders } = useGetRightHoldersQuery();

  const [pageEntries, setPageEntries] = useState<RightHolder[]>([]);
  const [numOfPages, setNumOfPages] = useState<number>(1);
  const [searchResultLength, setSearchResultLength] = useState<number>(0);

  // Sorting the list of rightHolders only when the list changes
  const sortedRightHolders = useMemo(() => sortRightholderList(rightHolders || []), [rightHolders]);

  useEffect(() => {
    const { pageEntries, numOfPages, searchResultLength } = computePageEntries(
      searchString,
      currentPage,
      pageSize,
      sortedRightHolders,
    );
    setPageEntries(pageEntries.filter((entry) => entry !== undefined));
    setNumOfPages(numOfPages);
    setSearchResultLength(searchResultLength);
  }, [searchString, currentPage, rightHolders]);

  return { pageEntries, numOfPages, searchResultLength };
};
