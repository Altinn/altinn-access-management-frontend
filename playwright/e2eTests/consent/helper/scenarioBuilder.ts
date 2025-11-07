import { ConsentApiRequests } from '../../../api-requests/ConsentApiRequests';
import { MaskinportenToken } from '../../../api-requests/MaskinportenToken';
import { fromPersons, toOrgs, fromOrgs } from './consentTestdata';
import { addTimeToNowUtc, pickRandom } from 'playwright/util/helper';

export const scenarioBuilder = {
  /**
   * Creates a person-to-org scenario for Maskinporten tests
   */
  personToOrgWithMaskinporten(maskinportenOrgId: string) {
    const fromPerson = pickRandom(fromPersons);
    const toOrg = maskinportenOrgId;
    const validTo = addTimeToNowUtc({ days: 5 });
    const api = new ConsentApiRequests(toOrg);
    const mpToken = new MaskinportenToken();
    return { fromPerson, toOrg, validTo, api, mpToken };
  },

  /**
   * Creates a person-to-org scenario for standard tests
   */
  personToOrg() {
    const fromPerson = pickRandom(fromPersons);
    const toOrg = pickRandom(toOrgs);
    const validTo = addTimeToNowUtc({ days: 2 });
    const api = new ConsentApiRequests(toOrg);
    return { fromPerson, toOrg, validTo, api };
  },

  /**
   * Creates an org-to-org scenario
   */
  orgToOrg() {
    const [fromOrg, fromPerson] = pickRandom(fromOrgs);
    const toOrg = pickRandom(toOrgs);
    const validTo = addTimeToNowUtc({ days: 2 });
    const api = new ConsentApiRequests(toOrg);
    return { fromOrg, fromPerson, toOrg, validTo, api };
  },
};
