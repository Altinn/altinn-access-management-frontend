import { useEffect } from 'react';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookupApi';

import { EditModal } from '../DelegationModal/EditModal';

interface AccessPackageDelegationModalProps {
  modalRef: React.RefObject<HTMLDialogElement>;
  toParty: Party;
  modalItem: AccessPackage | undefined;
  onClose?: () => void;
}

export const AccessPackageDelegationModal = ({
  modalRef,
  toParty,
  modalItem,
  onClose,
}: AccessPackageDelegationModalProps) => {
  useEffect(() => {
    const handleClose = () => onClose?.();

    modalRef.current?.addEventListener('close', handleClose);
    return () => modalRef.current?.removeEventListener('close', handleClose);
  }, [onClose]);

  return (
    <EditModal
      ref={modalRef}
      toParty={toParty}
      accessPackage={modalItem}
    />
  );
};
