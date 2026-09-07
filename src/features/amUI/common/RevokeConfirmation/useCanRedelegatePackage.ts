import { useLazyDelegationCheckQuery } from '@/rtk/features/accessPackageApi';

import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';

/**
 * Whether the logged in user can give an access package back again after deleting it, checked on
 * behalf of the party the package was given from. When the answer cannot be established we ask for
 * confirmation rather than skip it — a missed warning costs an access the user cannot restore,
 * while a spurious one costs a click.
 */
export const useCanRedelegatePackage = () => {
  const { fromParty } = usePartyRepresentation();
  const [runDelegationCheck] = useLazyDelegationCheckQuery();

  const canRedelegatePackage = async (packageId: string): Promise<boolean> => {
    if (!fromParty) return false;
    // Not preferCacheValue: this endpoint carries no tags and nothing invalidates it, so a cached
    // answer can be as old as the page.
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
