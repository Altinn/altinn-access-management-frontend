import { DelegationAction } from './EditModal';

interface GetAvailableActionsParams {
  canGiveAccess?: boolean;
  canRequestAccess?: boolean;
}

/** Returns the delegation actions available on a rights section.  */
export const getAvailableActions = ({
  canGiveAccess,
  canRequestAccess,
}: GetAvailableActionsParams): DelegationAction[] => {
  return [
    DelegationAction.REVOKE,
    ...(canGiveAccess ? [DelegationAction.DELEGATE] : []),
    ...(canRequestAccess ? [DelegationAction.REQUEST] : []),
  ];
};
