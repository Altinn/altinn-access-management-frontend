import React, { useRef, useState } from 'react';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookupApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';

import {
  AccessPackageList,
  packageActions,
} from '../../common/AccessPackageList/AccessPackageList';

import { AccessPackageInfoModal } from './AccessPackageInfoModal';
import { useGetUserInfoQuery } from '@/rtk/features/userInfoApi';
import { debounce } from '@/resources/utils';

import classes from '../DelegationModal/AccessPackages/PackageSearch.module.css';
import { Button, Search } from '@digdir/designsystemet-react';
import { t } from 'i18next';

export const ActiveDelegations = ({ toParty }: { toParty: Party }) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<AccessPackage | undefined>(undefined);
  const [showAllAreas, setShowAllAreas] = useState(false);
  const [searchString, setSearchString] = useState('');
  const { data: currentUser, isLoading: currentUserLoading } = useGetUserInfoQuery();

  const isCurrentUser = currentUser?.uuid === toParty.partyUuid;

  const [debouncedSearchString, setDebouncedSearchString] = useState('');

  const debouncedSearch = debounce((searchString: string) => {
    setDebouncedSearchString(searchString);
  }, 300);

  return (
    <>
      <search className={classes.searchSection}>
        <div className={classes.searchInputs}>
          <div className={classes.searchField}>
            <Search
              label={t('access_packages.search_label')}
              hideLabel={true}
              value={searchString}
              placeholder={t('access_packages.search_label')}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                debouncedSearch(event.target.value);
                setSearchString(event.target.value);
              }}
              size='sm'
              onClear={() => {
                setDebouncedSearchString('');
                setSearchString('');
              }}
            />
          </div>
          {debouncedSearchString === '' &&
            (!showAllAreas ? (
              <Button
                size='sm'
                variant='secondary'
                onClick={() => setShowAllAreas(!showAllAreas)}
              >
                Vis alle områder
              </Button>
            ) : (
              <Button
                size='sm'
                variant='secondary'
                onClick={() => setShowAllAreas(!showAllAreas)}
              >
                Skjul andre områder
              </Button>
            ))}
        </div>
        <AccessPackageList
          searchString={debouncedSearchString}
          isLoading={currentUserLoading}
          showAllPackages
          showAllAreas={debouncedSearchString !== '' || showAllAreas}
          onSelect={(accessPackage) => {
            setModalItem(accessPackage);
            modalRef.current?.showModal();
          }}
          fromPartyUuid={getCookie('AltinnPartyUuid')}
          toPartyUuid={toParty.partyUuid}
          useDeleteConfirm={isCurrentUser}
          availableActions={[
            packageActions.REVOKE,
            isCurrentUser ? packageActions.REQUEST : packageActions.DELEGATE,
          ]}
        />

        <AccessPackageInfoModal
          modalRef={modalRef}
          toParty={toParty}
          modalItem={modalItem}
          onClose={() => {
            setModalItem(undefined);
          }}
        />
      </search>
    </>
  );
};
