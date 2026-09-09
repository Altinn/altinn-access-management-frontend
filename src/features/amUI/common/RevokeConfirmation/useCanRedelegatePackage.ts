import { useLazyDelegationCheckQuery } from '@/rtk/features/accessPackageApi';
import { useGetIsHovedadminQuery } from '@/rtk/features/userInfoApi';

import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';

// Falls back to false when the check fails, so the user is asked rather than skipped.
export const useCanRedelegatePackage = () => {
  const { fromParty, toParty, selfParty } = usePartyRepresentation();
  const { data: isHovedadmin } = useGetIsHovedadminQuery();
  const [runDelegationCheck] = useLazyDelegationCheckQuery();

  const canRedelegatePackage = async (packageId: string): Promise<boolean> => {
    if (!fromParty) return false;
    // If the user is deleting their own access and is not hovedadmin, show the warning regardless
    // of the delegation check: the check passes only because they still hold the access.
    if (toParty?.partyUuid === selfParty?.partyUuid) return !!isHovedadmin;
    const check = runDelegationCheck({ party: fromParty.partyUuid });
    try {
      const checks = await check.unwrap();
      return checks.find((entry) => entry.package.id === packageId)?.result ?? false;
    } catch {
      return false;
    } finally {
      check.unsubscribe();
    }
  };

  return { canRedelegatePackage };
};
