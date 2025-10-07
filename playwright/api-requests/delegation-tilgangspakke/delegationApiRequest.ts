import { request } from '@playwright/test';
import { Token } from './../Token';

export class DelegationApiRequest {
  private tokenClass: Token;

  constructor() {
    this.tokenClass = new Token();
  }

  //Add org as 'Rettighetshaver' for delegating access pacakage
  public async addOrgForDelegation() {
    const apiRequestContext = await request.newContext();
    const token = await this.tokenClass.generateAltinnPersonalToken();

    // Build endpoint using env values
    const endpoint =
      `v1/enduser/connections` +
      `?party=${process.env.PARTY_ID}` +
      `&from=${process.env.PARTY_ID}` +
      `&to=${process.env.TO_ORG}`;

    // Full URL
    const url = `${process.env.PLATFORM_URL}${endpoint}`;

    const response = await apiRequestContext.post(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok()) {
      throw new Error(`Delegation creation failed: ${await response.text()}`);
    }
  }

  //Delegate access pacakge to 'Rettighetshaver'

  public async delegateAccessPkg() {
    const apiRequestContext = await request.newContext();
    const token = await this.tokenClass.generateAltinnPersonalToken();

    // Build endpoint using env values
    const endpoint =
      `v1/enduser/connections` +
      `?party=${process.env.PARTY_ID}` +
      `&from=${process.env.PARTY_ID}` +
      `&to=${process.env.TO_ORG}`;
    +`&package=${process.env.BYGG_PACKAGE_URN}`;
    +`&package=${process.env.OPPVEKST_PACKAGE_URN}`;
    +`&package=${process.env.VEI_PACKAGE_URN}`;

    // Full URL
    const url = `${process.env.PLATFORM_URL}${endpoint}`;

    const response = await apiRequestContext.post(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok()) {
      throw new Error(`Delegating access pacakge failed: ${await response.text()}`);
    }
  }

  /**
   * Deletes all delegations for configured party/org
   */
  public async deleteAllDelegations() {
    const apiRequestContext = await request.newContext();
    const token = await this.tokenClass.generateAltinnPersonalToken();

    // Build endpoint using env values
    const endpoint =
      `v1/enduser/connections` +
      `?party=${process.env.PARTY_ID}` +
      `&from=${process.env.PARTY_ID}` +
      `&to=${process.env.TO_ORG}` +
      `&cascade=true`;

    // Full URL
    const url = `${process.env.PLATFORM_URL}${endpoint}`;

    const response = await apiRequestContext.delete(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status() !== 204) {
      const errorBody = await response.text();
      throw new Error(`Delegation cleanup failed. Status: ${response.status()} - ${errorBody}`);
    }
  }
}
