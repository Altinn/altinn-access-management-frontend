import { Trans, useTranslation } from 'react-i18next';
import { Heading, Search } from '@digdir/designsystemet-react';
import { useState } from 'react';

import { debounce } from '@/resources/utils';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookupApi';
import { AccessPackageList } from '@/features/amUI/common/AccessPackageList/AccessPackageList';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import { useDelegationModalContext } from '../DelegationModalContext';

import classes from './PackageSearch.module.css';
import { ActionError } from '@/resources/hooks/useActionError';

export interface PackageSearchProps {
  onSelection: (pack: AccessPackage) => void;
  onActionError: (accessPackage: AccessPackage) => void;
  toParty: Party;
}

export const PackageSearch = ({ toParty, onSelection, onActionError }: PackageSearchProps) => {
  const { t } = useTranslation();
  const [debouncedSearchString, setDebouncedSearchString] = useState('');

  const { searchString, setSearchString, setCurrentPage, setActionError } =
    useDelegationModalContext();

  const debouncedSearch = debounce((searchString: string) => {
    setDebouncedSearchString(searchString);
    setCurrentPage(1);
  }, 300);

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
        <div className={classes.searchResults}>
          <AccessPackageList
            fromPartyUuid={getCookie('AltinnPartyUuid')}
            toPartyUuid={toParty.partyUuid}
            showAllAreas={true}
            showAllPackages={true}
            onSelect={onSelection}
            searchString={debouncedSearchString}
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
  );
};
