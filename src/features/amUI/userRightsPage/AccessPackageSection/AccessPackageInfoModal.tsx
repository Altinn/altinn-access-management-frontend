import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import { useGetUserInfoQuery } from '@/rtk/features/userInfoApi';
import type { ActionError } from '@/resources/hooks/useActionError';

import { DelegationAction, EditModal } from '../../common/DelegationModal/EditModal';
import { DelegationModalProvider } from '../../common/DelegationModal/DelegationModalContext';

interface AccessPackageInfoModalProps {
  modalRef: React.RefObject<HTMLDialogElement | null>;
  toPartyUuid: string;
  fromPartyUuid: string;
  modalItem: AccessPackage | undefined;
  onClose?: () => void;
  openWithError?: ActionError | null;
  modalActions?: DelegationAction | DelegationAction[];
}

export const AccessPackageInfoModal = ({
  modalRef,
  toPartyUuid,
  fromPartyUuid,
  modalItem,
  onClose,
  openWithError,
  modalActions,
}: AccessPackageInfoModalProps) => {
  const { data: currentUser } = useGetUserInfoQuery();
  const isCurrentUser = currentUser?.uuid === toPartyUuid;

  return (
    <DelegationModalProvider>
      <EditModal
        ref={modalRef}
        toPartyUuid={toPartyUuid}
        fromPartyUuid={fromPartyUuid}
        accessPackage={modalItem}
        openWithError={openWithError}
        onClose={onClose}
        availableActions={
          Array.isArray(modalActions)
            ? modalActions
            : modalActions !== undefined
              ? [modalActions]
              : [
                  !isCurrentUser ? DelegationAction.DELEGATE : DelegationAction.REQUEST,
                  DelegationAction.REVOKE,
                ]
        }
      />
    </DelegationModalProvider>
  );
};
