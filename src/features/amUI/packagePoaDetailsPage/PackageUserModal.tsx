import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookupApi';
import { PartyType } from '@/rtk/features/userInfoApi';

import type { UserActionTarget } from '../common/UserSearch/types';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { DelegationAction } from '../common/DelegationModal/EditModal';
import { getInheritedStatus } from '../common/useInheritedStatus';

import { PartyInfoModal } from './PartyInfoModal';

const SUCCESS_ANIMATION_DURATION = 2000;

export const mapUserToParty = (user: UserActionTarget): Party => ({
  partyId: 0,
  partyUuid: user.id,
  orgNumber: user.organizationIdentifier ?? undefined,
  name: user.name,
  partyTypeName:
    user.type?.toLowerCase() === 'organisasjon' ? PartyType.Organization : PartyType.Person,
  dateOfBirth: user.dateOfBirth ?? undefined,
  variant: user.variant ?? undefined,
});

export interface PackageUserModalHandle {
  /** Open the modal for the given user. */
  open: (user: UserActionTarget) => void;
  /** Play the success animation; called by the caller once an action resolves. */
  showSuccess: () => void;
}

interface PackageUserModalProps {
  accessPackage?: AccessPackage;
  /** Base actions for the package; REVOKE is dropped automatically for inherited access. */
  availableActions: DelegationAction[];
  isActionLoading: boolean;
  onDelegate: (user: UserActionTarget) => void;
  onRevoke: (user: UserActionTarget) => void;
}

/**
 * Give/revoke modal for a single user's access to a package on the package details page.
 *
 * Owns its own selection and success-animation state so the page can stay lean: open it
 * imperatively via the ref (`open(user)`) and trigger the success animation (`showSuccess()`)
 * once the shared action resolves. The displayed buttons follow the live access state — after a
 * revoke the modal stays open and offers "give" again.
 */
export const PackageUserModal = forwardRef<PackageUserModalHandle, PackageUserModalProps>(
  ({ accessPackage, availableActions, isActionLoading, onDelegate, onRevoke }, ref) => {
    const { fromParty } = usePartyRepresentation();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [selectedUser, setSelectedUser] = useState<UserActionTarget | null>(null);
    const [actionSuccess, setActionSuccess] = useState(false);

    useImperativeHandle(ref, () => ({
      open: (user) => {
        setSelectedUser(user);
        dialogRef.current?.showModal();
      },
      showSuccess: () => {
        setActionSuccess(true);
        setTimeout(() => setActionSuccess(false), SUCCESS_ANIMATION_DURATION);
      },
    }));

    const selectedUserPermissions = useMemo(
      () =>
        accessPackage?.permissions?.filter(
          (permission) => permission.to?.id === selectedUser?.id,
        ) ?? [],
      [accessPackage?.permissions, selectedUser?.id],
    );

    const selectedUserHasAccess = selectedUserPermissions.length > 0;
    const selectedUserAccessIsInherited = selectedUser?.isInherited ?? false;

    const selectedUserInheritedStatus = useMemo(
      () =>
        getInheritedStatus({
          permissions: selectedUserPermissions,
          toParty: selectedUser ? mapUserToParty(selectedUser) : undefined,
          fromParty,
        }),
      [selectedUserPermissions, selectedUser, fromParty],
    );

    return (
      <PartyInfoModal
        ref={dialogRef}
        partyInfo={
          selectedUser && accessPackage
            ? {
                party: mapUserToParty(selectedUser),
                accessPackage,
                userHasAccess: selectedUserHasAccess,
                inheritedStatus: selectedUserInheritedStatus,
                // Inherited access can't be revoked here, so hide the revoke button (mirrors the
                // list item, which hides it for inherited access).
                availableActions: selectedUserAccessIsInherited
                  ? availableActions.filter((action) => action !== DelegationAction.REVOKE)
                  : availableActions,
                isLoading: isActionLoading,
                isSuccess: actionSuccess,
                onDelegate: () => onDelegate(selectedUser),
                onRevoke: () => onRevoke(selectedUser),
              }
            : undefined
        }
        onClose={() => {
          setSelectedUser(null);
          setActionSuccess(false);
        }}
      />
    );
  },
);

PackageUserModal.displayName = 'PackageUserModal';
