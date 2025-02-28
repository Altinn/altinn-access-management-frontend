import { useEffect } from 'react';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookupApi';

import { EditModal } from '../DelegationModal/EditModal';

interface AccessPackageInfoModalProps {
  modalRef: React.RefObject<HTMLDialogElement>;
  toParty: Party;
  modalItem: AccessPackage | undefined;
  onClose?: () => void;
  openWithError?: { httpStatus: string; timestamp: string };
}

export const AccessPackageInfoModal = ({
  modalRef,
  toParty,
  modalItem,
  onClose,
  openWithError,
}: AccessPackageInfoModalProps) => {
  useEffect(() => {
    const handleClose = () => onClose?.();

    modalRef.current?.addEventListener('close', handleClose);
    return () => modalRef.current?.removeEventListener('close', handleClose);
  }, [onClose, modalRef]);

  return (
    <EditModal
      ref={modalRef}
      toParty={toParty}
      accessPackage={modalItem}
      openWithError={openWithError}
    />
  );
};
