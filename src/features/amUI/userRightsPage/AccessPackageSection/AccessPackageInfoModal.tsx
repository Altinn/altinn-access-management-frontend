import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { ActionError } from '@/resources/hooks/useActionError';

import { DelegationAction, EditModal } from '../../common/DelegationModal/EditModal';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';

interface AccessPackageInfoModalProps {
  modalRef: React.RefObject<HTMLDialogElement | null>;
  modalItem: AccessPackage | undefined;
  onClose?: () => void;
  openWithError?: ActionError | null;
  availableActions?: DelegationAction | DelegationAction[];
}

export const AccessPackageInfoModal = ({
  modalRef,
  modalItem,
  onClose,
  openWithError,
  availableActions,
}: AccessPackageInfoModalProps) => {
  const { selfParty, toParty } = usePartyRepresentation();
  const isCurrentUser = selfParty?.partyUuid === toParty?.partyUuid;

  const actions = Array.isArray(availableActions)
    ? availableActions
    : availableActions !== undefined
      ? [availableActions]
      : [
          !isCurrentUser ? DelegationAction.DELEGATE : DelegationAction.REQUEST,
          DelegationAction.REVOKE,
        ];

  return (
    <EditModal
      ref={modalRef}
      accessPackage={modalItem}
      openWithError={openWithError}
      onClose={onClose}
      availableActions={actions}
    />
  );
};
