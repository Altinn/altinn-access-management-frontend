import { useGetUserDelegationsQuery } from '@/rtk/features/accessPackageApi';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { DsSearch } from '@altinn/altinn-components';
import { debounce } from '@/resources/utils';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ExtendedAccessArea } from '../common/AccessPackageList/useAreaPackageList';

import classes from './PoaOverviewList.module.css';
import { AccessPackageList } from '../common/AccessPackageList/AccessPackageList';

export const PoaOverviewList = () => {
  const { t } = useTranslation();


  const [searchString, setSearchString] = useState('');

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchString(value);
    }, 300),
    [],
  );


  return (
    <>
      <search className={classes.searchInput}>
        <DsSearch data-size='sm'>
          <DsSearch.Input
            aria-label={t('access_packages.search_label')}
            placeholder={t('access_packages.search_label')}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              debouncedSearch(event.target.value);
            }}
          />
          <DsSearch.Clear
            onClick={() => {
              setSearchString('');
            }}
          />
        </DsSearch>
      </search>
      <AccessPackageList
        searchString={searchString}
        minimizeAvailablePackages={false}
        showAvailableToggle={false}
        showPermissions={true}
        showAllPackages={true}
        showAllAreas={true}
        showPackagesCount={false}
      />
  </>
  );
};
