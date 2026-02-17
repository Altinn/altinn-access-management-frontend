import { DelegationCheckedRight } from '@/rtk/features/singleRights/singleRightsApi';

export type ChipRight = {
  action: string;
  rightKey: string;
  delegable: boolean;
  checked: boolean;
  delegationReason: string;
};

export const mapRightsToChipRights = (
  rights: DelegationCheckedRight[],
  checked: (action: DelegationCheckedRight) => boolean,
  resourceOwnerCode: string,
): ChipRight[] => {
  return rights.map((action: DelegationCheckedRight) => {
    return {
      action: action.rule.name,
      rightKey: action.rule.key,
      delegable: action.result === true,
      checked: checked(action) || false,
      delegationReason: action.reasonCodes.length > 0 ? action.reasonCodes[0] : '',
    };
  });
};
