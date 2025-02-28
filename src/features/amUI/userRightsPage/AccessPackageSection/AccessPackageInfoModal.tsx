import { useEffect } from 'react';
import { useParams } from 'react-router';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookupApi';
import { useGetReporteeQuery, useGetUserInfoQuery } from '@/rtk/features/userInfoApi';

import { EditModal } from '../DelegationModal/EditModal';
import { ActionError } from '@/resources/hooks/useActionError';
import { DelegationModalProvider } from '../DelegationModal/DelegationModalContext';

interface AccessPackageInfoModalProps {
  modalRef: React.RefObject<HTMLDialogElement>;
  toParty: Party;
  modalItem: AccessPackage | undefined;
  onClose?: () => void;
  openWithError?: ActionError | null;
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

  const { data: reportee } = useGetReporteeQuery();
  const { id: rightHolderUuid } = useParams();

  const { data: currentUser } = useGetUserInfoQuery();
  const isCurrentUser = currentUser?.uuid === toParty.partyUuid;

  return (
    <EditModal
      ref={modalRef}
      toPartyUuid={rightHolderUuid ?? ''}
      fromPartyUuid={reportee?.partyUuid ?? ''}
      accessPackage={modalItem}
      availableActions={[
        !isCurrentUser ? DelegationAction.DELEGATE : DelegationAction.REQUEST,
        DelegationAction.REVOKE,
      ]}
    />
  );
};
