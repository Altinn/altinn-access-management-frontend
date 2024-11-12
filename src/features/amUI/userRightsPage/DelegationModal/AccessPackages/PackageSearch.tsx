import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Heading, Search } from '@digdir/designsystemet-react';

import { debounce } from '@/resources/utils';
import { useSearchQuery, type AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookup/lookupApi';
import { Avatar } from '@/features/amUI/common/Avatar/Avatar';

import { useDelegationModalContext } from '../DelegationModalContext';

import classes from './PackageSearch.module.css';

export interface PackageSearchProps {
  onSelection: (pack: AccessPackage) => void;
  toParty: Party;
}

const searchResultsPerPage = 5;

export const PackageSearch = ({ onSelection, toParty }: PackageSearchProps) => {
  const { t } = useTranslation();

  const { searchString, setSearchString, setCurrentPage } = useDelegationModalContext();

  const debouncedSearch = debounce((searchString: string) => {
    setSearchString(searchString);
    setCurrentPage(1);
  }, 300);

  const { data } = useSearchQuery(searchString);

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
              }}
              size='sm'
              onClear={() => {
                setSearchString('');
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
        <div className={classes.searchResults}>
          {data?.map((a) => (
            <ul key={a.id}>
              <div className={classes.packageArea}>
                <Avatar
                  size='sm'
                  logoUrl={a.iconUrl}
                  profile={'serviceOwner'}
                />
                {a.name}{' '}
              </div>
              <div className={classes.packages}>
                {a.accessPackages.map((p) => (
                  <ul key={p.id}>{p.name}</ul>
                ))}
              </div>
            </ul>
          ))}
        </div>
      </search>
    </>
  );
};
