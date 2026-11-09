import { DelegationAction } from './EditModal';

interface GetAvailableActionsParams {
  canGiveAccess?: boolean;
  canRequestAccess?: boolean;
  /** True when the right holder's rights are fixed by the vendor (standard system users) */
  isVendorFixedRights?: boolean;
}

/** Returns the delegation actions available on a rights section.  */
export const getAvailableActions = ({
  canGiveAccess,
  canRequestAccess,
  isVendorFixedRights,
}: GetAvailableActionsParams): DelegationAction[] => {
  if (isVendorFixedRights) {
    return [];
  }
  return [
    DelegationAction.REVOKE,
    ...(canGiveAccess ? [DelegationAction.DELEGATE] : []),
    ...(canRequestAccess ? [DelegationAction.REQUEST] : []),
  ];
};
