import { DelegationCheckedRight } from '@/rtk/features/singleRights/singleRightsApi';

export type ChipRight = {
  action: string;
  rightKey: string;
  delegable: boolean;
  checked: boolean;
  delegationReason: string;
  inherited?: boolean;
};

export const mapRightsToChipRights = (
  rights: DelegationCheckedRight[],
  isChecked: (right: DelegationCheckedRight) => boolean,
  isInherited: (rightKey: string) => boolean,
): ChipRight[] => {
  return rights.map((right: DelegationCheckedRight) => {
    return {
      action: right.rule.name,
      rightKey: right.rule.key,
      delegable: right.result === true,
      checked: isChecked(right) || false,
      delegationReason: right.reasonCodes.length > 0 ? right.reasonCodes[0] : '',
      inherited: isInherited(right.rule.key),
    };
  });
};
