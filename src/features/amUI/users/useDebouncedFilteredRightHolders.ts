import { getTotalNumOfPages, getArrayPage, debounce } from '@/resources/utils';
import type { RightHolder } from '@/rtk/features/userInfo/userInfoApi';
import { useGetRightHoldersQuery } from '@/rtk/features/userInfo/userInfoApi';
import { useState, useMemo, useEffect } from 'react';

const isSearchMatch = (searchString: string, rightHolder: RightHolder): boolean => {
  const isNameMatch = rightHolder.name.toLowerCase().indexOf(searchString.toLowerCase()) > -1;
  const isPersonIdMatch = rightHolder.personId === searchString;
  const isOrgNrMatch = rightHolder.organizationNumber === searchString;
  return isNameMatch || isPersonIdMatch || isOrgNrMatch;
};

export const useDebouncedFilteredRightHolders = (
  searchString: string,
  currentPage: number,
  pageSize: number,
) => {
  const { data: rightHolders, isLoading: isFetching } = useGetRightHoldersQuery();
  const [pageEntries, setPageEntries] = useState<RightHolder[]>([]);
  const [numOfPages, setNumOfPages] = useState<number>(1);
  const [searchResultLength, setSearchResultLength] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const computePageEntries = () => {
    if (!rightHolders) {
      setPageEntries([]);
      setNumOfPages(1);
      setSearchResultLength(0);
      setLoading(false);
      return;
    }

    const filteredRightHolders: RightHolder[] = searchString ? [] : rightHolders;
    // we dont need to filter if searchString is empty
    if (searchString) {
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
    }
    const searchResultLength = filteredRightHolders.length;
    const numPages = getTotalNumOfPages(filteredRightHolders, pageSize);

    setPageEntries(getArrayPage(filteredRightHolders, currentPage, pageSize));
    setNumOfPages(numPages);
    setSearchResultLength(searchResultLength);
    setLoading(false);
  };

  const debouncedComputePageEntries = useMemo(
    () => debounce(computePageEntries, 200),
    [rightHolders, currentPage, searchString],
  );

  useEffect(() => {
    setLoading(true);
    debouncedComputePageEntries();
    return () => {
      debouncedComputePageEntries.cancel();
    };
  }, [debouncedComputePageEntries]);

  return { pageEntries, numOfPages, searchResultLength, loading: isFetching || loading };
};
