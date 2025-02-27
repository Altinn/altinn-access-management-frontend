import { useEffect } from 'react';

import type { Role } from '@/rtk/features/roleApi';
import { useGetUserInfoQuery } from '@/rtk/features/userInfoApi';

import { DelegationAction, EditModal } from '../DelegationModal/EditModal';

interface RoleInfoModalProps {
  modalRef: React.RefObject<HTMLDialogElement>;
  toPartyUuid: string;
  fromPartyUuid: string;
  role?: Role;
  onClose?: () => void;
  availableActions?: DelegationAction[];
}

export const RoleInfoModal = ({
  modalRef,
  toPartyUuid,
  fromPartyUuid,
  role,
  onClose,
}: RoleInfoModalProps) => {
  useEffect(() => {
    const handleClose = () => onClose?.();

    modalRef.current?.addEventListener('close', handleClose);
    return () => modalRef.current?.removeEventListener('close', handleClose);
  }, [onClose, modalRef]);

  const { data: currentUser } = useGetUserInfoQuery();

  const isCurrentUser = currentUser?.uuid === toPartyUuid;

  return (
    <EditModal
      ref={modalRef}
      toPartyUuid={toPartyUuid}
      fromPartyUuid={fromPartyUuid}
      role={role}
      availableActions={[
        DelegationAction.REVOKE,
        isCurrentUser ? DelegationAction.REQUEST : DelegationAction.DELEGATE,
      ]}
    />
  );
};
