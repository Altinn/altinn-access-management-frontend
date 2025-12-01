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
    const mpToken = new MaskinportenToken('MASKINPORTEN_CLIENT_ID', 'MASKINPORTEN_JWK');
    return {
      fromPerson,
      toOrg,
      validTo,
      api,
      mpToken,
      clientIdEnv: 'MASKINPORTEN_CLIENT_ID',
      jwkEnv: 'MASKINPORTEN_JWK',
    };
  },

  /**
   * Creates a person-to-org scenario for Maskinporten tests using behalf_of client
   */
  personToOrgWithMaskinportenBehalfOf(org: string) {
    const fromPerson = pickRandom(fromPersons);
    const toOrg = org;
    const validTo = addTimeToNowUtc({ days: 5 });
    const api = new ConsentApiRequests(toOrg);
    const mpToken = new MaskinportenToken(
      'MASKINPORTEN_BEHALF_OF_CLIENT_ID',
      'MASKINPORTEN_BEHALF_OF_JWK',
    );
    return {
      fromPerson,
      toOrg,
      validTo,
      api,
      mpToken,
      clientIdEnv: 'MASKINPORTEN_BEHALF_OF_CLIENT_ID',
      jwkEnv: 'MASKINPORTEN_BEHALF_OF_JWK',
    };
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
