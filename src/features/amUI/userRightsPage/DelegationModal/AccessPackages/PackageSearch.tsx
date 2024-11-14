import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Heading, Paragraph, Search } from '@digdir/designsystemet-react';
import { useState } from 'react';

import { debounce } from '@/resources/utils';
import { useSearchQuery, type AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookup/lookupApi';
import { Avatar } from '@/features/amUI/common/Avatar/Avatar';
import { List, ListItem } from '@/components';

import { useDelegationModalContext } from '../DelegationModalContext';

import classes from './PackageSearch.module.css';

export interface PackageSearchProps {
  onSelection: (pack: AccessPackage) => void;
  toParty: Party;
}

export const PackageSearch = ({ toParty }: PackageSearchProps) => {
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
            <ListItem key={a.id}>
              <div className={classes.packageArea}>
                <Avatar
                  size='sm'
                  logoUrl={a.iconUrl}
                  profile={'serviceOwner'}
                />
                <Heading size='2xs'>{a.name}</Heading>
              </div>
              <Paragraph size='xs'>{a.description}</Paragraph>
              <List
                spacing
                className={classes.packages}
              >
                {a.accessPackages.map((p) => (
                  <ListItem key={p.id}>
                    <Paragraph size='xs'>
                      <i>{p.name}</i>
                    </Paragraph>
                  </ListItem>
                ))}
              </List>
            </ListItem>
          ))}
        </List>
      </search>
    </>
  );
};
