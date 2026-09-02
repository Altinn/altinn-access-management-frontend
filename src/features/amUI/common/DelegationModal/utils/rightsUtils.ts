import { DelegationCheckedRight, Right } from '@/rtk/features/singleRights/singleRightsApi';
import { InheritedStatusType } from '../../useInheritedStatus';

type InheritedReason = {
  toParty: string;
  viaParty: string;
  reason: InheritedStatusType;
};

export type ChipRight = {
  rightName: string;
  rightKey: string;
  delegable: boolean;
  checked: boolean;
  delegated: boolean;
  delegationReason: string;
  inherited?: boolean;
  inheritedReason?: InheritedReason;
};

type MapRightsToChipRightsOptions = {
  isDelegated?: (right: DelegationCheckedRight) => boolean;
  isInherited?: (rightKey: string) => boolean;
  isChecked?: (right: DelegationCheckedRight) => boolean;
  getInheritedReason?: (rightKey: string) => InheritedReason | undefined;
};

/** Whether every one of the held rights can be delegated, according to a delegation check. */
export const canRedelegateRights = (
  heldRightKeys: string[],
  checkedRights: DelegationCheckedRight[] = [],
): boolean =>
  heldRightKeys.every((key) =>
    checkedRights.some((checked) => checked.right.key === key && checked.result),
  );

export const mapRightsToChipRights = (
  rightsMeta: Right[],
  delegationCheckedRights?: DelegationCheckedRight[],
  {
    isDelegated = () => false,
    isInherited = () => false,
    isChecked,
    getInheritedReason,
  }: MapRightsToChipRightsOptions = {},
): ChipRight[] => {
  let mappableRights: DelegationCheckedRight[] = [];

  if (delegationCheckedRights) {
    mappableRights = rightsMeta.map((rightMeta) => {
      const matchingCheckedRight = delegationCheckedRights.find(
        (checkedRight) => checkedRight.right.key === rightMeta.key,
      );
      return matchingCheckedRight
        ? { ...matchingCheckedRight, right: rightMeta }
        : { right: rightMeta, result: false, reasonCodes: [] };
    });
  } else {
    mappableRights = rightsMeta.map((rightMeta) => ({
      right: rightMeta,
      result: false,
      reasonCodes: [],
    }));
  }

  const checkedPredicate = isChecked ?? isDelegated;

  return mappableRights.map((right: DelegationCheckedRight) => {
    const delegated = isDelegated(right);
    const inherited = isInherited(right.right.key);
    return {
      rightName: right.right.name,
      rightKey: right.right.key,
      delegable: right.result === true,
      checked: checkedPredicate(right),
      delegated,
      delegationReason: right.reasonCodes.length > 0 ? right.reasonCodes[0] : '',
      inherited,
      inheritedReason:
        inherited && getInheritedReason ? getInheritedReason(right.right.key) : undefined,
    };
  });
};
