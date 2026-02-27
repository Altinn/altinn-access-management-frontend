import { DelegationCheckedRight } from '@/rtk/features/singleRights/singleRightsApi';

export type ChipRight = {
  action: string;
  rightKey: string;
  delegable: boolean;
  checked: boolean;
  delegated: boolean;
  directlyDelegated: boolean;
  delegationReason: string;
  inherited?: boolean;
};

export const mapRightsToChipRights = (
  rights: DelegationCheckedRight[],
  isDelegated: (right: DelegationCheckedRight) => boolean,
  isDirectlyDelegated: (rightKey: string) => boolean,
  isInherited: (rightKey: string) => boolean,
): ChipRight[] => {
  return rights.map((right: DelegationCheckedRight) => {
    const delegated = isDelegated(right);
    return {
      action: right.right.name,
      rightKey: right.right.key,
      delegable: right.result === true,
      checked: delegated,
      delegated,
      directlyDelegated: isDirectlyDelegated(right.right.key),
      delegationReason: right.reasonCodes.length > 0 ? right.reasonCodes[0] : '',
      inherited: isInherited(right.right.key),
    };
  });
};
