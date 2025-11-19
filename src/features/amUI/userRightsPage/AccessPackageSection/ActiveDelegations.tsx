import React, { useRef, useState } from 'react';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';

import { AccessPackageList } from '../../common/AccessPackageList/AccessPackageList';
import { DelegationAction } from '../../common/DelegationModal/EditModal';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { useDelegationModalContext } from '../../common/DelegationModal/DelegationModalContext';

import { AccessPackageInfoModal } from './AccessPackageInfoModal';
import { useTranslation } from 'react-i18next';
import { useGetIsHovedadminQuery } from '@/rtk/features/userInfoApi';

interface ActiveDelegationsProps {
  searchString?: string;
}

export const ActiveDelegations = ({ searchString }: ActiveDelegationsProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<AccessPackage | undefined>(undefined);
  const { setActionError } = useDelegationModalContext();
  const { toParty, selfParty, actingParty, isLoading } = usePartyRepresentation();
  const { data: isHovedadmin } = useGetIsHovedadminQuery();
  const canGiveAccess =
    actingParty?.partyUuid !== toParty?.partyUuid && // Acting party cannot grant access to itself
    (toParty?.partyUuid !== selfParty?.partyUuid || isHovedadmin); // Only hovedadmin can give access to themselves
  const { t } = useTranslation();

  return (
    <>
      <AccessPackageList
        isLoading={isLoading}
        showPackagesCount
        showAllPackages
        minimizeAvailablePackages={!searchString}
        searchString={searchString}
        onSelect={(accessPackage) => {
          setModalItem(accessPackage);
          modalRef.current?.showModal();
        }}
        availableActions={[
          DelegationAction.REVOKE,
          canGiveAccess ? DelegationAction.DELEGATE : DelegationAction.REQUEST,
        ]}
        onDelegateError={(accessPackage, error) => {
          setActionError(error);
          setModalItem(accessPackage);
          modalRef.current?.showModal();
        }}
        onRevokeError={(accessPackage, error) => {
          setActionError(error);
          setModalItem(accessPackage);
          modalRef.current?.showModal();
        }}
        noPackagesText={t('access_packages.user_has_no_packages')}
      />
      <AccessPackageInfoModal
        modalRef={modalRef}
        modalItem={modalItem}
      />
    </>
  );
};
