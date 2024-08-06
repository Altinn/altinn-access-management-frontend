import { getTotalNumOfPages, getArrayPage } from '@/resources/utils';
import type { RightHolder } from '@/rtk/features/userInfo/userInfoApi';
import { useGetRightHoldersQuery } from '@/rtk/features/userInfo/userInfoApi';
import { useState, useEffect } from 'react';

const isSearchMatch = (searchString: string, rightHolder: RightHolder): boolean => {
  const isNameMatch = rightHolder.name.toLowerCase().indexOf(searchString.toLowerCase()) > -1;
  const isPersonIdMatch = rightHolder.personId === searchString;
  const isOrgNrMatch = rightHolder.organizationNumber === searchString;
  return isNameMatch || isPersonIdMatch || isOrgNrMatch;
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

  const filteredRightHolders: RightHolder[] = [];

  rightHolders.forEach((rightHolder) => {
    if (isSearchMatch(searchString, rightHolder)) {
      filteredRightHolders.push(rightHolder);
    } else if (rightHolder.inheritingRightHolders?.length > 0) {
      // check for searchString matches in inheritingRightHolders
      const matchingInheritingItems = rightHolder.inheritingRightHolders.filter(
        (inheritRightHolder) => isSearchMatch(searchString, inheritRightHolder),
      );
      if (matchingInheritingItems.length > 0) {
        filteredRightHolders.push({
          ...rightHolder,
          inheritingRightHolders: matchingInheritingItems,
        });
      }
    }
  });

  return {
    pageEntries: getArrayPage(filteredRightHolders, currentPage, pageSize),
    numOfPages: getTotalNumOfPages(filteredRightHolders, pageSize),
    searchResultLength: filteredRightHolders.length,
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

  useEffect(() => {
    const { pageEntries, numOfPages, searchResultLength } = computePageEntries(
      searchString,
      currentPage,
      pageSize,
      rightHolders,
    );
    setPageEntries(pageEntries);
    setNumOfPages(numOfPages);
    setSearchResultLength(searchResultLength);
  }, [searchString, currentPage, rightHolders]);

  return { pageEntries, numOfPages, searchResultLength };
};
