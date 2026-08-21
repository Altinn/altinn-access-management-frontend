import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookupApi';
import { PartyType } from '@/rtk/features/userInfoApi';

const HOVEDADMINISTRATOR_URN = 'urn:altinn:accesspackage:hovedadministrator';
const TILGANGSSTYRING_URNS = [
  'urn:altinn:accesspackage:tilgangsstyrer',
  'urn:altinn:accesspackage:innbygger-tilgangsstyring-privatperson',
];

export type PackageAction = 'delegate' | 'request';

export type PackageWarning =
  | 'hovedadministrator'
  | 'tilgangsstyring_person_to_person'
  | 'tilgangsstyring_person_to_org'
  | 'tilgangsstyring_org_to_org';

export interface PendingPackageAction {
  action: PackageAction;
  warning: PackageWarning;
  accessPackage: AccessPackage;
  fromParty: Party;
  toParty: Party;
}

const isPerson = (party: Party) => party.partyTypeName === PartyType.Person;

/**
 * Hovedadministrator and the access management packages are the most powerful packages in Altinn,
 * so the user has to confirm before they are delegated or requested. Returns which warning text
 * applies for the given package and party combination, or null when no confirmation is needed.
 */
export const getPackageWarning = (
  accessPackage: AccessPackage,
  fromParty: Party,
  toParty: Party,
): PackageWarning | null => {
  if (accessPackage.urn === HOVEDADMINISTRATOR_URN) {
    return 'hovedadministrator';
  }
  if (!accessPackage.urn || !TILGANGSSTYRING_URNS.includes(accessPackage.urn)) {
    return null;
  }
  if (isPerson(fromParty)) {
    return isPerson(toParty) ? 'tilgangsstyring_person_to_person' : 'tilgangsstyring_person_to_org';
  }
  // Organizations commonly give access management to their own employees, so no warning there.
  return isPerson(toParty) ? null : 'tilgangsstyring_org_to_org';
};
