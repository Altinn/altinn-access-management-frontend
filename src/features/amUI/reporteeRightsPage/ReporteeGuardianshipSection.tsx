import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { DsHeading, Skeleton } from '@altinn/altinn-components';

import { useGetUserDelegationsQuery, type AccessPackage } from '@/rtk/features/accessPackageApi';

import { AccessPackageList } from '../common/AccessPackageList/AccessPackageList';
import { AccessPackageInfoModal } from '../userRightsPage/AccessPackageSection/AccessPackageInfoModal';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { isGuardianshipUrn } from '@/resources/utils';

export const ReporteeGuardianshipSection = () => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<AccessPackage | undefined>(undefined);

  const { toParty, fromParty, actingParty, isLoading: isLoadingParty } = usePartyRepresentation();

  useEffect(() => {
    const handleClose = () => setModalItem(undefined);
    modalRef.current?.addEventListener('close', handleClose);
    return () => modalRef.current?.removeEventListener('close', handleClose);
  }, []);

  const { data: accesses, isLoading: isLoadingAccesses } = useGetUserDelegationsQuery(
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

  return (
    <>
      <Skeleton loading={isLoadingAccesses || isLoadingParty}>
        <DsHeading
          level={2}
          data-size='2xs'
        >
          {t('guardianships.current_guardianship_title', {
            count: numberOfAccesses ?? 0,
          })}
        </DsHeading>
      </Skeleton>
      <AccessPackageList
        isLoading={isLoadingAccesses || isLoadingParty}
        availableActions={[]}
        showAllPackages
        showPackagesCount
        showOnlyGuardianships
        minimizeAvailablePackages
        onSelect={(accessPackage) => {
          setModalItem(accessPackage);
          modalRef.current?.showModal();
        }}
      />
      <AccessPackageInfoModal
        modalRef={modalRef}
        modalItem={modalItem}
        availableActions={[]}
      />
    </>
  );
};
