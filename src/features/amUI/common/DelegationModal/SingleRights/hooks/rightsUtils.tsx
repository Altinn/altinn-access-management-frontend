import { DelegationCheckedAction } from '@/rtk/features/singleRights/singleRightsApi';

export type ChipRight = {
  action: string;
  rightKey: string;
  delegable: boolean;
  checked: boolean;
  delegationReason: string;
};

export const mapRightsToChipRights = (
  rights: DelegationCheckedAction[],
  checked: (action: DelegationCheckedAction) => boolean,
  resourceOwnerCode: string,
): ChipRight[] => {
  return rights.map((action: DelegationCheckedAction) => {
    return {
      action: action.actionName,
      rightKey: action.actionKey,
      delegable: action.result === true,
      checked: checked(action) || false,
      delegationReason: action.reasons.length > 0 ? action.reasons[0].reasonKey : '',
    };
  });
};
