import { DelegationCheckedRight, Right } from '@/rtk/features/singleRights/singleRightsApi';

export type ChipRight = {
  rightName: string;
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

/**
 * Maps rights metadata and delegation check results into ChipRight objects
 *
 * - isDelegated: returns true if the right is already delegated to the party
 * - isInherited: returns true if the right comes from a role (not directly delegated)
 * - isChecked: override for the checked state (defaults to isDelegated)
 */
export const mapRightsToChipRights = (
  rightsMeta: Right[],
  delegationCheckedRights?: DelegationCheckedRight[],
  {
    isDelegated = () => false,
    isInherited = () => false,
    isChecked,
  }: MapRightsToChipRightsOptions = {},
): ChipRight[] => {
  // Merge rightsMeta with delegation check results, falling back to non-delegable for unknown rights
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
    };
  });
};
