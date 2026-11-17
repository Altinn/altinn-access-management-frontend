import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGetResourceOwnersQuery } from '@/rtk/features/resourceApi';
import { arraysEqual, debounce } from '@/resources/utils';

import { ResourceFilterToolbar } from '../ResourceFilterToolbar/ResourceFilterToolbar';

interface PackageSearchToolbarProps {
  searchString: string;
  setSearchString: (searchString: string) => void;
  serviceOwners: string[];
  setServiceOwners: (serviceOwners: string[]) => void;
}

export const PackageSearchToolbar = ({
  searchString,
  setSearchString,
  serviceOwners,
  setServiceOwners,
}: PackageSearchToolbarProps) => {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState(searchString);
  const [syncedSearchString, setSyncedSearchString] = useState(searchString);
  if (searchString !== syncedSearchString) {
    setSyncedSearchString(searchString);
    setSearchInput(searchString);
  }
  const { data: resourceOwners } = useGetResourceOwnersQuery();

  const serviceOwnerOptions = (resourceOwners ?? []).map((owner) => ({
    label: owner.organisationName || owner.organisationCode,
    value: owner.organisationCode,
  }));

  const debouncedSetSearchString = useMemo(
    () => debounce((value: string) => setSearchString(value), 300),
    [setSearchString],
  );

  useEffect(() => () => debouncedSetSearchString.cancel(), [debouncedSetSearchString]);

  return (
    <ResourceFilterToolbar
      search={searchInput}
      setSearch={(value: string) => {
        setSearchInput(value);
        if (value) {
          debouncedSetSearchString(value);
        } else {
          debouncedSetSearchString.cancel();
          setSearchString('');
        }
      }}
      searchPlaceholder={t('access_packages.search_label')}
      filterState={serviceOwners}
      setFilterState={(newServiceOwners: string[]) => {
        if (!arraysEqual(newServiceOwners, serviceOwners)) {
          setServiceOwners(newServiceOwners);
        }
      }}
      serviceOwnerOptions={serviceOwnerOptions}
    />
  );
};
