import { type TestPerson } from 'playwright/util/testDelegationdatautil';

import { type HttpMethod, platformUrl, type Query, send } from '../apiRequest';
import { token } from '../callAs';

export class DelegationApiRequest {
  //Add org as 'Rettighetshaver' for delegating access pacakage
  public async addOrgForDelegation(
    fromPerson: TestPerson,
    toPerson: TestPerson,
    authPerson: TestPerson,
  ): Promise<void> {
    await this.request(authPerson, 'POST', 'accessmanagement/api/v1/enduser/connections', {
      party: fromPerson.PartyUUID,
      from: fromPerson.PartyUUID,
      to: toPerson.PartyUUID,
    });
  }

  //Delegate access pacakge to 'Rettighetshaver'
  public async delegateAccessPkg(
    fromPerson: TestPerson,
    toPerson: TestPerson,
    pkg: string,
    authPerson: TestPerson,
  ): Promise<void> {
    await this.request(
      authPerson,
      'POST',
      'accessmanagement/api/v1/enduser/connections/accesspackages',
      {
        party: fromPerson.PartyUUID,
        from: fromPerson.PartyUUID,
        to: toPerson.PartyUUID,
        package: pkg,
      },
    );
  }

  public async cleanupDelegations(fromOrg: TestPerson, toOrg: TestPerson, authPerson: TestPerson) {
    await this.request(authPerson, 'DELETE', 'accessmanagement/api/v1/enduser/connections', {
      party: fromOrg.PartyUUID,
      from: fromOrg.PartyUUID,
      to: toOrg.PartyUUID,
      cascade: true,
    });
  }

  private async request(authPerson: TestPerson, method: HttpMethod, path: string, query: Query) {
    const accessToken = await token.getPersonalCleanupAltinnToken(authPerson);
    await send(method, platformUrl(path, query), { token: accessToken });
  }
}
