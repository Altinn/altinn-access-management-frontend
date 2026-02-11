import { DsSearch } from '@altinn/altinn-components';
import { debounce } from '@/resources/utils';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import classes from './PoaOverviewPage.module.css';
import { AccessPackageList } from '../common/AccessPackageList/AccessPackageList';
import { Link } from 'react-router';

export const GuardianshipPermissions = () => {
  const { t } = useTranslation();

  const [searchString, setSearchString] = useState('');
  const [debouncedSearchString, setDebouncedSearchString] = useState(searchString ?? '');

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchString(value);
    }, 300),
    [],
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <>
      <search className={classes.searchInput}>
        <DsSearch data-size='sm'>
          <DsSearch.Input
            value={searchString}
            aria-label={t('guardianships.search_label')}
            placeholder={t('guardianships.search_label')}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setSearchString(event.target.value);
              debouncedSearch(event.target.value);
            }}
          />
          <DsSearch.Clear
            onClick={() => {
              debouncedSearch.cancel();
              setSearchString('');
              debouncedSearch('');
            }}
          />
        </DsSearch>
      </search>
      <AccessPackageList
        searchString={debouncedSearchString}
        minimizeAvailablePackages={false}
        showAvailableToggle={false}
        showPermissions
        showAllPackages={true}
        showAllAreas={true}
        showOnlyGuardianships
        showPackagesCount={false}
        packageAs={(props) => (
          <Link
            to={`/poa-overview/access-package/${props.packageId}`}
            {...props}
          />
        )}
        noPackagesText={t('access_packages.no_packages')}
      />
    </>
  );
};
