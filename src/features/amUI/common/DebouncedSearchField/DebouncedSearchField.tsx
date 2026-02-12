import React, { useCallback, useEffect, useState } from 'react';
import { DsSearch } from '@altinn/altinn-components';

import classes from './DebouncedSearchField.module.css';
import { debounce } from '@/resources/utils';

interface DebouncedSearchFieldProps {
  setDebouncedSearchString: (value: string) => void;
  placeholder: string;
}
export const DebouncedSearchField = ({
  placeholder,
  setDebouncedSearchString,
}: DebouncedSearchFieldProps) => {
  // Local search state with debounce to avoid excessive backend calls
  const [searchString, setSearchString] = useState<string>('');

  const debouncedUpdate = useCallback(
    debounce((value: string) => {
      setDebouncedSearchString(value);
    }, 300),
    [],
  );

  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  return (
    <div className={classes.inputs}>
      <div className={classes.searchField}>
        <DsSearch data-size='sm'>
          <DsSearch.Input
            aria-label={placeholder}
            placeholder={placeholder}
            value={searchString}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const value = event.target.value;
              setSearchString(value);
              debouncedUpdate(value);
            }}
          />
          <DsSearch.Clear
            onClick={() => {
              debouncedUpdate.cancel();
              setSearchString('');
              setDebouncedSearchString('');
            }}
          />
        </DsSearch>
      </div>
    </div>
  );
};
