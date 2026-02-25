import { DelegationCheckedRight } from '@/rtk/features/singleRights/singleRightsApi';
import { InheritedStatusMessageType } from '../../../useInheritedStatus';
import { Party } from '@/rtk/features/lookupApi';

export type ChipRight = {
  action: string;
  rightKey: string;
  delegable: boolean;
  checked: boolean;
  delegationReason: string;
  inheritedStatus?: InheritedStatusMessageType[];
  toParty?: Party;
};
type ChipDelegationCheckedRight = DelegationCheckedRight & {
  isChecked: boolean;
  toParty?: Party;
  inheritedStatus?: InheritedStatusMessageType[];
};
export const mapRightsToChipRights = (rights: ChipDelegationCheckedRight[]): ChipRight[] => {
  return rights.map((right: ChipDelegationCheckedRight) => {
    return {
      action: right.rule.name,
      rightKey: right.rule.key,
      delegable: right.result === true,
      checked: right.isChecked,
      delegationReason: right.reasonCodes.length > 0 ? right.reasonCodes[0] : '',
      inheritedStatus: right.inheritedStatus,
      toParty: right.toParty,
    };
  });
};
