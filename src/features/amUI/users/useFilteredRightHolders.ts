import { useState, useEffect, useMemo } from 'react';

import { getTotalNumOfPages, getArrayPage } from '@/resources/utils';
import type { RightHolder } from '@/rtk/features/userInfoApi';
import { useGetRightHoldersQuery, useGetUserInfoQuery } from '@/rtk/features/userInfoApi';

export interface FilteredRightHolder extends RightHolder {
  matchInInheritingRightHolders?: boolean;
}

const isSearchMatch = (searchString: string, rightHolder: RightHolder): boolean => {
  const isNameMatch = rightHolder.name.toLowerCase().indexOf(searchString.toLowerCase()) > -1;
  const isPersonIdMatch = rightHolder.personId === searchString;
  const isOrgNrMatch = rightHolder.organizationNumber === searchString;
  return isNameMatch || isPersonIdMatch || isOrgNrMatch;
};

const sortRightHolders = (rightHolders: RightHolder[]): RightHolder[] =>
  [...rightHolders].sort((a, b) => a.name.localeCompare(b.name));

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

const extractFromList = (
  list: RightHolder[],
  uuidToRemove: string,
  onRemove: (removed: RightHolder) => void,
): RightHolder[] => {
  const remainingList = list.reduce<RightHolder[]>((acc, item) => {
    if (item.partyUuid === uuidToRemove) {
      onRemove(item);
    } else {
      acc.push(item);
    }
    return acc;
  }, []);
  return remainingList;
};

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

  const searchResult: FilteredRightHolder[] = [];

  rightHolders.forEach((rightHolder) => {
    if (isSearchMatch(searchString, rightHolder)) {
      searchResult.push(rightHolder);
    } else if (rightHolder.inheritingRightHolders?.length > 0) {
      // check for searchString matches in inheritingRightHolders
      const matchingInheritingItems = rightHolder.inheritingRightHolders.filter(
        (inheritRightHolder) => isSearchMatch(searchString, inheritRightHolder),
      );
      if (matchingInheritingItems.length > 0) {
        // add rightHolder with matching inheritingRightHolders and flag to show them as expanded
        searchResult.push({
          ...rightHolder,
          matchInInheritingRightHolders: true,
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
  const { data: currentUser } = useGetUserInfoQuery();
  const [pageEntries, setPageEntries] = useState<RightHolder[]>([]);
  const [numOfPages, setNumOfPages] = useState<number>(1);
  const [searchResultLength, setSearchResultLength] = useState<number>(0);
  const [currentUserAsRightHolder, setCurrentUserAsRightHolder] = useState<RightHolder>();

  // Extract currentUser from rightHolders and sort remaining list alphabetically
  const sortedRightHolders = useMemo(() => {
    const remainingAfterExtraction = extractFromList(
      rightHolders || [],
      currentUser?.uuid ?? 'loading',
      setCurrentUserAsRightHolder,
    );
    return sortRightholderList(remainingAfterExtraction);
  }, [rightHolders, currentUser]);

  useEffect(() => {
    const { pageEntries, numOfPages, searchResultLength } = computePageEntries(
      searchString,
      currentPage,
      pageSize,
      sortedRightHolders,
    );
    setPageEntries(pageEntries);
    setNumOfPages(numOfPages);
    setSearchResultLength(searchResultLength);
  }, [searchString, currentPage, rightHolders, currentUser]);

  return { pageEntries, numOfPages, searchResultLength, currentUserAsRightHolder };
};
