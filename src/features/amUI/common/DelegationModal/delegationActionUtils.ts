import { DelegationAction } from './EditModal';

interface GetAvailableActionsParams {
  canGiveAccess?: boolean;
  canRequestAccess?: boolean;
  /** True when the right holder's rights are locked (system users locked by the vendor) */
  isRightsLocked?: boolean;
}

/** Returns the delegation actions available on a rights section.  */
export const getAvailableActions = ({
  canGiveAccess,
  canRequestAccess,
  isRightsLocked,
}: GetAvailableActionsParams): DelegationAction[] => {
  if (isRightsLocked) {
    return [];
  }
  return [
    DelegationAction.REVOKE,
    ...(canGiveAccess ? [DelegationAction.DELEGATE] : []),
    ...(canRequestAccess ? [DelegationAction.REQUEST] : []),
  ];
};
