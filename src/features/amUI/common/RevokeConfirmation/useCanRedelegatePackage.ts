import { useLazyDelegationCheckQuery } from '@/rtk/features/accessPackageApi';

import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';

import { isForbiddenError } from './isForbiddenError';

/**
 * Whether the logged in user can give an access package back again after deleting it, checked on
 * behalf of the party the package was given from. Unknown answers count as yes, except 403.
 */
export const useCanRedelegatePackage = () => {
  const { fromParty } = usePartyRepresentation();
  const [runDelegationCheck] = useLazyDelegationCheckQuery();

  const canRedelegatePackage = async (packageId: string): Promise<boolean> => {
    if (!fromParty) return true;
    const check = runDelegationCheck({ party: fromParty.partyUuid }, true);
    try {
      const checks = await check.unwrap();
      return checks.find((entry) => entry.package.id === packageId)?.result ?? true;
    } catch (error) {
      return !isForbiddenError(error);
    } finally {
      check.unsubscribe();
    }
  };

  return { canRedelegatePackage };
};
