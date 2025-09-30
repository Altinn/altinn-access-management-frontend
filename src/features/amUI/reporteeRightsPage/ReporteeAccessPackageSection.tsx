import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { DsHeading, Skeleton } from '@altinn/altinn-components';

import { useGetUserDelegationsQuery, type AccessPackage } from '@/rtk/features/accessPackageApi';

import { AccessPackageList } from '../common/AccessPackageList/AccessPackageList';
import { DelegationAction } from '../common/DelegationModal/EditModal';
import { AccessPackageInfoModal } from '../userRightsPage/AccessPackageSection/AccessPackageInfoModal';
import { useDelegationModalContext } from '../common/DelegationModal/DelegationModalContext';
import { AccessPackageInfoAlert } from '../userRightsPage/AccessPackageSection/AccessPackageInfoAlert';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';

export const ReporteeAccessPackageSection = () => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<AccessPackage | undefined>(undefined);
  const { setActionError } = useDelegationModalContext();

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

  const numberOfAccesses = accesses ? Object.values(accesses).flat().length : 0;

  return (
    <>
      <AccessPackageInfoAlert />
      <Skeleton loading={isLoadingAccesses || isLoadingParty}>
        <DsHeading
          level={2}
          data-size='2xs'
          id='access_packages_title'
        >
          {t('access_packages.current_access_packages_title', {
            count: numberOfAccesses ?? 0,
          })}
        </DsHeading>
      </Skeleton>
      <AccessPackageList
        isLoading={isLoadingAccesses || isLoadingParty}
        availableActions={[DelegationAction.REVOKE, DelegationAction.REQUEST]}
        showAllPackages
        minimizeAvailablePackages
        onSelect={(accessPackage) => {
          setModalItem(accessPackage);
          modalRef.current?.showModal();
        }}
        onDelegateError={(accessPackage, errorInfo) => {
          setActionError(errorInfo);
          setModalItem(accessPackage);
          modalRef.current?.showModal();
        }}
        onRevokeError={(accessPackage, errorInfo) => {
          setActionError(errorInfo);
          setModalItem(accessPackage);
          modalRef.current?.showModal();
        }}
        noPackagesText={t('access_packages.user_has_no_packages')}
      />
      <AccessPackageInfoModal
        modalRef={modalRef}
        modalItem={modalItem}
        modalActions={[DelegationAction.REVOKE, DelegationAction.REQUEST]}
      />
    </>
  );
};
