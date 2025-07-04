import { Trans, useTranslation } from 'react-i18next';
import { useCallback, useState } from 'react';
import { DsSearch, DsHeading } from '@altinn/altinn-components';

import { debounce } from '@/resources/utils';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookupApi';
import { AccessPackageList } from '@/features/amUI/common/AccessPackageList/AccessPackageList';

import { useDelegationModalContext } from '../DelegationModalContext';
import type { DelegationAction } from '../EditModal';

import classes from './PackageSearch.module.css';

export interface PackageSearchProps {
  onSelection: (pack: AccessPackage) => void;
  onActionError: (accessPackage: AccessPackage) => void;
  toParty?: Party;
  availableActions?: DelegationAction[];
}

export const PackageSearch = ({
  toParty,
  onSelection,
  onActionError,
  availableActions,
}: PackageSearchProps) => {
  const { t } = useTranslation();
  const { searchString, setSearchString, setCurrentPage, setActionError } =
    useDelegationModalContext();
  const [debouncedSearchString, setDebouncedSearchString] = useState(searchString ?? '');

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchString(value);
      setCurrentPage(1);
    }, 300),
    [],
  );

  return (
    toParty && (
      <>
        <DsHeading
          level={2}
          data-size='sm'
        >
          <Trans
            i18nKey='delegation_modal.give_package_to_name'
            values={{ name: toParty.name }}
            components={{ strong: <strong /> }}
          />
        </DsHeading>
        <search className={classes.searchSection}>
          <div className={classes.searchInputs}>
            <div className={classes.searchField}>
              <DsSearch data-size='sm'>
                <DsSearch.Input
                  aria-label={t('access_packages.search_label')}
                  placeholder={t('access_packages.search_label')}
                  value={searchString}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    debouncedSearch(event.target.value);
                    setSearchString(event.target.value);
                  }}
                />
                <DsSearch.Clear
                  onClick={() => {
                    setDebouncedSearchString('');
                    setSearchString('');
                    setCurrentPage(1);
                  }}
                />
              </DsSearch>
            </div>
          </div>
          <div className={classes.searchResults}>
            <AccessPackageList
              showAllAreas={true}
              showAllPackages={true}
              onSelect={onSelection}
              searchString={debouncedSearchString}
              availableActions={availableActions}
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
      </>
    )
  );
};
