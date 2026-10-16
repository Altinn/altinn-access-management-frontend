import type { AgentDelegationCustomer, SystemUserAccessPackage } from '../types';

/**
 * The system user's access packages the customer has not given the facilitator access to.
 * The facilitator's own organization is never missing any.
 */
export const getMissingAccessPackages = (
  customer: AgentDelegationCustomer,
  systemUserAccessPackages: SystemUserAccessPackage[],
): SystemUserAccessPackage[] => {
  if (customer.isSelfOrg) {
    return [];
  }
  const customerPackageUrns = customer.access.flatMap((access) => access.packages);
  return systemUserAccessPackages.filter(
    (accessPackage) => !customerPackageUrns.includes(accessPackage.urn),
  );
};
