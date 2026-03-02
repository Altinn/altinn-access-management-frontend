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

type MapRightsToChipRightsOptions = {
  isDelegated?: (right: DelegationCheckedRight) => boolean;
  isInherited?: (rightKey: string) => boolean;
  isChecked?: (right: DelegationCheckedRight) => boolean;
};

export const mapRightsToChipRights = (
  rights: DelegationCheckedRight[],
  {
    isDelegated = () => false,
    isInherited = () => false,
    isChecked,
  }: MapRightsToChipRightsOptions = {},
): ChipRight[] => {
  const checkedPredicate = isChecked ?? isDelegated;

  return rights.map((right: DelegationCheckedRight) => {
    const delegated = isDelegated(right);
    const inherited = isInherited(right.right.key);
    return {
      action: right.right.name,
      rightKey: right.right.key,
      delegable: right.result === true,
      checked: checkedPredicate(right),
      delegated,
      directlyDelegated: delegated && !inherited,
      delegationReason: right.reasonCodes.length > 0 ? right.reasonCodes[0] : '',
      inherited,
    };
  });
};
