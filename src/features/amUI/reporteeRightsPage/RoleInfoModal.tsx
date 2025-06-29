import { useEffect } from 'react';

import type { Role } from '@/rtk/features/roleApi';

import { DelegationAction, EditModal } from '../common/DelegationModal/EditModal';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';

interface RoleInfoModalProps {
  modalRef: React.RefObject<HTMLDialogElement>;
  role?: Role;
  onClose?: () => void;
}

export const RoleInfoModal = ({ modalRef, role, onClose }: RoleInfoModalProps) => {
  useEffect(() => {
    const handleClose = () => onClose?.();

    modalRef.current?.addEventListener('close', handleClose);
    return () => modalRef.current?.removeEventListener('close', handleClose);
  }, [onClose, modalRef]);

  const { selfParty, toParty } = usePartyRepresentation();

  const isCurrentUser = selfParty && toParty && selfParty.partyUuid === toParty.partyUuid;

  return (
    <EditModal
      ref={modalRef}
      role={role}
      availableActions={[
        !isCurrentUser ? DelegationAction.DELEGATE : DelegationAction.REQUEST,
        DelegationAction.REVOKE,
      ]}
    />
  );
};
