import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsHeading, DsSearch } from '@altinn/altinn-components';

import { AccessPackage, useGetUserDelegationsQuery } from '@/rtk/features/accessPackageApi';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { TabContentSkeleton } from '../../common/RightsTabs/TabContentSkeleton';

import classes from './AccessPackageSection.module.css';
import { debounce, isGuardianshipUrn } from '@/resources/utils';
import { AccessPackageList } from '../../common/AccessPackageList/AccessPackageList';
import { AccessPackageInfoModal } from './AccessPackageInfoModal';

export const GuardianshipSection = () => {
  const { t } = useTranslation();
  const {
    toParty,
    fromParty,
    actingParty,
    isLoading: loadingPartyRepresentation,
  } = usePartyRepresentation();

  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<AccessPackage | undefined>(undefined);

  const { data: accesses, isLoading: loadingAccesses } = useGetUserDelegationsQuery(
    {
      from: fromParty?.partyUuid ?? '',
      to: toParty?.partyUuid ?? '',
      party: actingParty?.partyUuid ?? '',
    },
    { skip: !toParty?.partyUuid || !fromParty?.partyUuid || !actingParty?.partyUuid },
  );

  const numberOfAccesses = accesses
    ? Object.values(accesses)
        .flat()
        .filter((item) => isGuardianshipUrn(item.package.urn)).length
    : 0;

  // Local search state with debounce to avoid excessive backend calls
  const [searchString, setSearchString] = useState<string>('');
  const [debouncedSearchString, setDebouncedSearchString] = useState<string>('');

  const debouncedUpdate = useCallback(
    debounce((value: string) => {
      setDebouncedSearchString(value);
    }, 300),
    [],
  );

  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  return (
    <>
      {loadingPartyRepresentation || loadingAccesses ? (
        <TabContentSkeleton />
      ) : (
        <>
          <div className={classes.headerSection}>
            <DsHeading
              level={2}
              data-size='2xs'
            >
              {t('guardianships.current_guardianship_title', { count: numberOfAccesses })}
            </DsHeading>
          </div>
          <div className={classes.inputs}>
            {numberOfAccesses > 0 && (
              <div className={classes.searchField}>
                <DsSearch data-size='sm'>
                  <DsSearch.Input
                    aria-label={t('guardianships.search_label')}
                    placeholder={t('guardianships.search_label')}
                    value={searchString}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      const value = event.target.value;
                      setSearchString(value);
                      debouncedUpdate(value);
                    }}
                  />
                  <DsSearch.Clear
                    onClick={() => {
                      debouncedUpdate.cancel();
                      setSearchString('');
                      setDebouncedSearchString('');
                    }}
                  />
                </DsSearch>
              </div>
            )}
          </div>
          <AccessPackageList
            isLoading={loadingPartyRepresentation}
            showPackagesCount
            showAllPackages
            showOnlyGuardianships
            minimizeAvailablePackages={!debouncedSearchString}
            searchString={debouncedSearchString}
            onSelect={(accessPackage) => {
              setModalItem(accessPackage);
              modalRef.current?.showModal();
            }}
            availableActions={[]}
          />
          <AccessPackageInfoModal
            modalRef={modalRef}
            modalItem={modalItem}
            availableActions={[]}
          />
        </>
      )}
    </>
  );
};
