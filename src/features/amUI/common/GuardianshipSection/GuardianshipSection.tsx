import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsHeading } from '@altinn/altinn-components';

import { type AccessPackage, useGetUserDelegationsQuery } from '@/rtk/features/accessPackageApi';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';

import { isGuardianshipUrn } from '@/resources/utils';
import { AccessPackageList } from '../../common/AccessPackageList/AccessPackageList';
import { AccessPackageInfoModal } from '../../userRightsPage/AccessPackageSection/AccessPackageInfoModal';
import { DebouncedSearchField } from '../DebouncedSearchField/DebouncedSearchField';

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
  const [debouncedSearchString, setDebouncedSearchString] = useState<string>('');

  return (
    <>
      <div>
        <DsHeading
          level={2}
          data-size='2xs'
        >
          {t('guardianships.current_guardianship_title', { count: numberOfAccesses })}
        </DsHeading>
      </div>
      {numberOfAccesses > 0 && (
        <DebouncedSearchField
          placeholder={t('guardianships.search_label')}
          setDebouncedSearchString={setDebouncedSearchString}
        />
      )}
      <AccessPackageList
        isLoading={loadingAccesses || loadingPartyRepresentation}
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
  );
};
