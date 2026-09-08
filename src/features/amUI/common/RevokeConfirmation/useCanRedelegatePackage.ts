import { useLazyDelegationCheckQuery } from '@/rtk/features/accessPackageApi';

import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';

// Falls back to false when the check fails, so the user is asked rather than skipped.
export const useCanRedelegatePackage = () => {
  const { fromParty } = usePartyRepresentation();
  const [runDelegationCheck] = useLazyDelegationCheckQuery();

  const canRedelegatePackage = async (packageId: string): Promise<boolean> => {
    if (!fromParty) return false;
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
