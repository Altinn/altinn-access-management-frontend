import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { DsHeading } from '@altinn/altinn-components';

import { AccessPackageList } from '../common/AccessPackageList/AccessPackageList';
import { DelegationAction } from '../common/DelegationModal/EditModal';
import { AccessPackageInfoModal } from '../userRightsPage/AccessPackageSection/AccessPackageInfoModal';
import { useDelegationModalContext } from '../common/DelegationModal/DelegationModalContext';
import { OldRolesAlert } from '../common/OldRolesAlert/OldRolesAlert';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';

interface ReporteeAccessPackageSectionProps {
  numberOfAccesses?: number;
}

export const ReporteeAccessPackageSection = ({
  numberOfAccesses,
}: ReporteeAccessPackageSectionProps) => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [modalItem, setModalItem] = useState<AccessPackage | undefined>(undefined);
  const { setActionError } = useDelegationModalContext();

  useEffect(() => {
    const handleClose = () => setModalItem(undefined);
    modalRef.current?.addEventListener('close', handleClose);
    return () => modalRef.current?.removeEventListener('close', handleClose);
  }, []);

  return (
    <>
      <OldRolesAlert />
      <DsHeading
        level={2}
        data-size='2xs'
        id='access_packages_title'
      >
        {t('access_packages.current_access_packages_title', { count: numberOfAccesses })}
      </DsHeading>
      <AccessPackageList
        availableActions={[DelegationAction.REVOKE, DelegationAction.REQUEST]}
        useDeleteConfirm
        showAllPackages
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
      />
      <AccessPackageInfoModal
        modalRef={modalRef}
        modalItem={modalItem}
        modalActions={[DelegationAction.REVOKE, DelegationAction.REQUEST]}
      />
    </>
  );
};
