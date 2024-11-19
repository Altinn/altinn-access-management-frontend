import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Heading, Search } from '@digdir/designsystemet-react';
import { useState } from 'react';

import { debounce } from '@/resources/utils';
import { useSearchQuery, type AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookup/lookupApi';
import { List } from '@/components';

import { useDelegationModalContext } from '../DelegationModalContext';

import classes from './PackageSearch.module.css';
import AccessAreaListItem from './AccessAreaListItem';

export interface PackageSearchProps {
  onSelection: (pack: AccessPackage) => void;
  toParty: Party;
}

export const PackageSearch = ({ toParty, onSelection }: PackageSearchProps) => {
  const { t } = useTranslation();
  const [debouncedSearchString, setDebouncedSearchString] = useState('');

  const { searchString, setSearchString, setCurrentPage } = useDelegationModalContext();

  const debouncedSearch = debounce((searchString: string) => {
    setDebouncedSearchString(searchString);
    setCurrentPage(1);
  }, 300);

  const { data } = useSearchQuery(debouncedSearchString);

  return (
    <>
      <Heading
        level={2}
        size='sm'
      >
        <Trans
          i18nKey='delegation_modal.give_package_to_name'
          values={{ name: toParty.name }}
          components={{ strong: <strong /> }}
        />
      </Heading>
      <search className={classes.searchSection}>
        <div className={classes.searchInputs}>
          <div className={classes.searchField}>
            <Search
              label={t('single_rights.search_label')}
              hideLabel={true}
              value={searchString}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                debouncedSearch(event.target.value);
                setSearchString(event.target.value);
              }}
              size='sm'
              onClear={() => {
                setDebouncedSearchString('');
                setSearchString('');
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
        <List
          spacing
          className={classes.searchResults}
        >
          {data?.map((a) => (
            <AccessAreaListItem
              key={a.id}
              accessPackageArea={a}
              onSelection={onSelection}
            />
          ))}
        </List>
      </search>
    </>
  );
};
