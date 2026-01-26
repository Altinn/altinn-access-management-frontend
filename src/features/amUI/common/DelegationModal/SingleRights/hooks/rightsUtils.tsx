import { RightStatus } from '@/dataObjects/dtos/resourceDelegation';
import { DelegationCheckedRight } from '@/rtk/features/singleRights/singleRightsApi';
import { BFFDelegatedStatus } from '@/rtk/features/singleRights/singleRightsSlice';

export type ChipRight = {
  action: string;
  rightKey: string;
  delegable: boolean;
  checked: boolean;
  delegationReason: string;
};

export const mapRightsToChipRights = (
  rights: DelegationCheckedRight[],
  checked: (right: DelegationCheckedRight) => boolean,
  resourceOwnerCode: string,
): ChipRight[] => {
  return rights.map((right: DelegationCheckedRight) => {
    const splitActionKey = right.rightKey.split(/[,:]/g);
    const actionSpecifier = splitActionKey.filter(
      (keyPart) => keyPart !== right.action && keyPart !== resourceOwnerCode.toLowerCase(),
    )[1];
    const actionName = actionSpecifier ? right.action + '-' + actionSpecifier : right.action;

    return {
      action: actionName,
      rightKey: right.rightKey,
      delegable:
        right.status === RightStatus.Delegable || right.status === BFFDelegatedStatus.Delegated,
      checked: checked(right) || false,
      delegationReason: right.reasonCodes.length > 0 ? right.reasonCodes[0] : '',
    };
  });
};
