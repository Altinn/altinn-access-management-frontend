import { useEffect } from 'react';

import type { Party } from '@/rtk/features/lookupApi';
import type { Role } from '@/rtk/features/roleApi';
import { useGetUserInfoQuery } from '@/rtk/features/userInfoApi';

import { DelegationAction, EditModal } from '../DelegationModal/EditModal';

interface RoleInfoModalProps {
  modalRef: React.RefObject<HTMLDialogElement>;
  toParty: Party;
  role?: Role;
  onClose?: () => void;
  availableActions?: DelegationAction[];
}

export const RoleInfoModal = ({ modalRef, toParty, role, onClose }: RoleInfoModalProps) => {
  useEffect(() => {
    const handleClose = () => onClose?.();

    modalRef.current?.addEventListener('close', handleClose);
    return () => modalRef.current?.removeEventListener('close', handleClose);
  }, [onClose, modalRef]);

  const { data: currentUser } = useGetUserInfoQuery();

  const isCurrentUser = currentUser?.uuid === toParty.partyUuid;

  return (
    <EditModal
      ref={modalRef}
      toParty={toParty}
      role={role}
      availableActions={[
        DelegationAction.REVOKE,
        isCurrentUser ? DelegationAction.REQUEST : DelegationAction.DELEGATE,
      ]}
    />
  );
};
