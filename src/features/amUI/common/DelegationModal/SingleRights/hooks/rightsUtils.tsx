import { DelegationCheckedRight, Right } from '@/rtk/features/singleRights/singleRightsApi';

export type ChipRight = {
  action: string;
  rightKey: string;
  delegable: boolean;
  checked: boolean;
  delegated: boolean;
  delegationReason: string;
  inherited?: boolean;
};

type MapRightsToChipRightsOptions = {
  isDelegated?: (right: DelegationCheckedRight) => boolean;
  isInherited?: (rightKey: string) => boolean;
  isChecked?: (right: DelegationCheckedRight) => boolean;
};

export const mapRightsToChipRights = (
  rightsMeta: Right[],
  delegationCheckedRights?: DelegationCheckedRight[],
  {
    isDelegated = () => false,
    isInherited = () => false,
    isChecked,
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
      action: right.right.name,
      rightKey: right.right.key,
      delegable: right.result === true,
      checked: checkedPredicate(right),
      delegated,
      delegationReason: right.reasonCodes.length > 0 ? right.reasonCodes[0] : '',
      inherited,
    };
  });
};
