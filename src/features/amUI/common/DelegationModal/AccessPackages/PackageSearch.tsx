import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsParagraph } from '@altinn/altinn-components';

import { AccessPackageList } from '@/features/amUI/common/AccessPackageList/AccessPackageList';
import type { AreaExpandedState } from '@/features/amUI/common/AccessPackageList/useAreaExpandedState';
import type { PartyEntity } from '@/dataObjects/dtos/Party';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import { useGetResourceOwnersQuery } from '@/rtk/features/resourceApi';
import { arraysEqual, debounce } from '@/resources/utils';

import { useDelegationModalContext } from '../DelegationModalContext';
import { type DelegationAction } from '../EditModal';
import { ResourceFilterToolbar } from '../../ResourceFilterToolbar/ResourceFilterToolbar';
import { AccessPackageInfoPopover } from '../../AccessPackageInfoPopover/AccessPackageInfoPopover';

import classes from './PackageSearch.module.css';

export interface PackageSearchProps {
  onSelection: (pack: AccessPackage) => void;
  onActionError: (accessPackage: AccessPackage) => void;
  toParty?: PartyEntity;
  availableActions?: DelegationAction[];
  expandedState?: AreaExpandedState;
}

export const PackageSearch = ({
  toParty,
  onSelection,
  onActionError,
  availableActions,
  expandedState,
}: PackageSearchProps) => {
  const { t } = useTranslation();
  const { searchString, setSearchString, filters, setFilters, setActionError } =
    useDelegationModalContext();
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
    toParty && (
      <div className={classes.container}>
        <div className={classes.description}>
          <DsParagraph>{t('delegation_modal.package_delegation_description')}</DsParagraph>
          <AccessPackageInfoPopover />
        </div>
        <search>
          <div className={classes.searchInputs}>
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
              filterState={filters}
              setFilterState={(newFilters: string[]) => {
                if (!arraysEqual(newFilters, filters)) {
                  setFilters(newFilters);
                }
              }}
              serviceOwnerOptions={serviceOwnerOptions}
            />
          </div>
          <div className={classes.searchResults}>
            <AccessPackageList
              showAllAreas={true}
              showAllPackages={true}
              showPackagesCount={true}
              onSelect={onSelection}
              searchString={searchString}
              serviceOwners={filters}
              availableActions={availableActions}
              expandedState={expandedState}
              onDelegateError={(accessPackage, errorInfo) => {
                onActionError(accessPackage);
                setActionError(errorInfo);
              }}
              onRevokeError={(accessPackage, errorInfo) => {
                onActionError(accessPackage);
                setActionError(errorInfo);
              }}
            />
          </div>
        </search>
      </div>
    )
  );
};
