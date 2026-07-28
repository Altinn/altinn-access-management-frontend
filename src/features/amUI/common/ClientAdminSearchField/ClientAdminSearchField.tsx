import React, { useCallback } from 'react';
import { DsSearch } from '@altinn/altinn-components';
import { debounce } from '@/resources/utils';
import classes from './ClientAdminSearchField.module.css';

interface ClientAdminSearchFieldProps {
  searchPlaceholder: string;
  setSearchString: (newSearch: string) => void;
  children?: React.ReactNode;
}

export const ClientAdminSearchField = ({
  searchPlaceholder,
  setSearchString,
  children,
}: ClientAdminSearchFieldProps) => {
  const onSearch = useCallback(
    debounce((newSearchString: string) => {
      setSearchString(newSearchString);
    }, 300),
    [],
  );

  return (
    <div className={classes.search}>
      <DsSearch className={classes.searchBar}>
        <DsSearch.Input
          aria-label={searchPlaceholder}
          placeholder={searchPlaceholder}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => onSearch(event.target.value)}
        />
        <DsSearch.Clear
          onClick={() => {
            onSearch.cancel();
            setSearchString('');
          }}
        />
      </DsSearch>
      {children}
    </div>
  );
};
