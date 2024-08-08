import { getTotalNumOfPages, getArrayPage } from '@/resources/utils';
import type { RightHolder } from '@/rtk/features/userInfo/userInfoApi';
import {
  PartyType,
  useGetRightHoldersQuery,
  useGetUserInfoQuery,
} from '@/rtk/features/userInfo/userInfoApi';
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
  currentUserUuid?: string,
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
  let currentUser: RightHolder = {
    partyUuid: '',
    partyType: PartyType.Person,
    registryRoles: [],
    name: '',
    inheritingRightHolders: [],
  };

  rightHolders.forEach((rightHolder) => {
    if (rightHolder.partyUuid === currentUserUuid) {
      // remove current user from paginated list
      currentUser = rightHolder;
    } else if (isSearchMatch(searchString, rightHolder)) {
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
    currentUserAsRightHolder: currentUser,
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

  useEffect(() => {
    const { pageEntries, numOfPages, searchResultLength, currentUserAsRightHolder } =
      computePageEntries(searchString, currentPage, pageSize, currentUser?.uuid, rightHolders);
    setPageEntries(pageEntries);
    setNumOfPages(numOfPages);
    setSearchResultLength(searchResultLength);
    setCurrentUserAsRightHolder(currentUserAsRightHolder);
  }, [searchString, currentPage, rightHolders, currentUser]);

  return { pageEntries, numOfPages, searchResultLength, currentUserAsRightHolder };
};
