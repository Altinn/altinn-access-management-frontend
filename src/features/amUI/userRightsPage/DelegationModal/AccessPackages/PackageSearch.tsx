import { Trans, useTranslation } from 'react-i18next';
import { Heading, Search } from '@digdir/designsystemet-react';
import { useState } from 'react';

import { debounce } from '@/resources/utils';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookupApi';
// import { useSnackbar } from '@/features/amUI/common/Snackbar';
// import { useDelegateAccessPackage } from '@/resources/hooks/useDelegateAccessPackage';
// import { useRevokeAccessPackage } from '@/resources/hooks/useRevokeAccessPackage';
import { AreaList } from '@/features/amUI/common/AreaList/AreaList';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import { useDelegationModalContext } from '../DelegationModalContext';

import classes from './PackageSearch.module.css';

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

  // const { openSnackbar } = useSnackbar();
  // const delegate = useDelegateAccessPackage();
  // const revoke = useRevokeAccessPackage();

  // const onDelegate = async (accessPackage: AccessPackage) => {
  //   delegate(
  //     toParty,
  //     accessPackage,
  //     () => {
  //       openSnackbar({
  //         message: t('access_packages.package_delegation_success', {
  //           accessPackage: accessPackage.name,
  //           name: toParty.name,
  //         }),
  //       });
  //     },
  //     () => {
  //       openSnackbar({
  //         message: t('access_packages.package_delegation_error', {
  //           accessPackage: accessPackage.name,
  //           name: toParty.name,
  //         }),
  //       });
  //     },
  //   );
  // };

  // const onRevoke = async (accessPackage: AccessPackage) => {
  //   revoke(
  //     toParty,
  //     accessPackage,
  //     () => {
  //       openSnackbar({
  //         message: t('access_packages.package_deletion_success', {
  //           accessPackage: accessPackage.name,
  //           name: toParty.name,
  //         }),
  //       });
  //     },
  //     () => {
  //       openSnackbar({
  //         message: t('access_packages.package_deletion_error', {
  //           accessPackage: accessPackage.name,
  //           name: toParty.name,
  //         }),
  //       });
  //     },
  //   );
  // };

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
          <AreaList
            fromPartyUuid={getCookie('AltinnPartyUuid')}
            toPartyUuid={toParty.partyUuid}
            showAllAreas={true}
            showAllPackages={true}
            onSelect={onSelection}
            // onDelegateSuccess={onDelegate}
            // onRevokeSuccess={onRevoke}
            searchString={debouncedSearchString}
          />
        </div>
      </search>
    </>
  );
};
