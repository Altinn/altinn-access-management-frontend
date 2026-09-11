import { Token } from './Token';
import { env } from 'playwright/util/helper';

/** A supplier or consumer connection as returned by the Maskinporten BFF. */
export interface MaskinportenConnection {
  party: {
    id: string;
    name: string;
    organizationIdentifier: string;
  };
}

/**
 * The Maskinporten-administrasjon endpoints.
 *
 * "Supplier" (leverandør) is an organisation that has received API access from
 * the acting party; "consumer" (konsument) is one that has given API access to
 * it. `party` is always the acting party, and `supplier`/`consumer` is the other
 * organisation's **organisation number**, not a party UUID.
 *
 * Every call requires the acting party to hold the Maskinporten administrator
 * access package (`GET user/isMaskinportenAdmin`). An organisation's daglig
 * leder satisfies this.
 */
export class MaskinportenApiRequests {
  private tokenClass: Token;

  constructor() {
    this.tokenClass = new Token();
  }

  /**
   * Adds an organisation as a supplier of the acting party.
   *
   * @param pid - PID of a user who may administer Maskinporten for `partyOrgNo`.
   * @param partyOrgNo - The acting organisation.
   * @param supplierOrgNo - The organisation to add as supplier.
   */
  public async addSupplier(pid: string, partyOrgNo: string, supplierOrgNo: string): Promise<void> {
    const party = await this.tokenClass.getPartyUuid(partyOrgNo);
    await this.request(pid, 'POST', `suppliers?party=${party}&supplier=${supplierOrgNo}`);
  }

  public async getSuppliers(pid: string, partyOrgNo: string): Promise<MaskinportenConnection[]> {
    const party = await this.tokenClass.getPartyUuid(partyOrgNo);
    const response = await this.request(pid, 'GET', `suppliers?party=${party}`);
    return response.status === 204 ? [] : response.json();
  }

  public async getConsumers(pid: string, partyOrgNo: string): Promise<MaskinportenConnection[]> {
    const party = await this.tokenClass.getPartyUuid(partyOrgNo);
    const response = await this.request(pid, 'GET', `consumers?party=${party}`);
    return response.status === 204 ? [] : response.json();
  }

  /**
   * Removes a supplier. `cascade` also drops any API access delegated to them,
   * which is what the UI's "Slett leverandør" does.
   */
  public async removeSupplier(
    pid: string,
    partyOrgNo: string,
    supplierOrgNo: string,
    cascade = true,
  ): Promise<void> {
    const party = await this.tokenClass.getPartyUuid(partyOrgNo);
    await this.request(
      pid,
      'DELETE',
      `suppliers?party=${party}&supplier=${supplierOrgNo}&cascade=${cascade}`,
    );
  }

  /**
   * Grants a supplier access to one API (a MaskinportenSchema resource).
   *
   * @param resourceId - The resource's identifier, as returned by scope search.
   *   Not every resource in the search is delegable — some are absent from the
   *   access-management database and answer 400 "The resource is invalid".
   */
  public async addSupplierResource(
    pid: string,
    partyOrgNo: string,
    supplierOrgNo: string,
    resourceId: string,
  ): Promise<void> {
    const party = await this.tokenClass.getPartyUuid(partyOrgNo);
    await this.request(
      pid,
      'POST',
      `suppliers/resources?party=${party}&supplier=${supplierOrgNo}&resource=${encodeURIComponent(resourceId)}`,
    );
  }

  public async removeSupplierResource(
    pid: string,
    partyOrgNo: string,
    supplierOrgNo: string,
    resourceId: string,
  ): Promise<void> {
    const party = await this.tokenClass.getPartyUuid(partyOrgNo);
    await this.request(
      pid,
      'DELETE',
      `suppliers/resources?party=${party}&supplier=${supplierOrgNo}&resource=${encodeURIComponent(resourceId)}`,
    );
  }

  /** The APIs a supplier has been granted. */
  public async getSupplierResources(
    pid: string,
    partyOrgNo: string,
    supplierOrgNo: string,
  ): Promise<unknown[]> {
    const party = await this.tokenClass.getPartyUuid(partyOrgNo);
    const response = await this.request(
      pid,
      'GET',
      `suppliers/resources?party=${party}&supplier=${supplierOrgNo}`,
    );
    return response.status === 204 ? [] : response.json();
  }

  /**
   * Issues an authenticated call against the Maskinporten BFF, which lives on the
   * app host (BASE_URL origin) rather than the platform host.
   */
  private async request(
    pid: string,
    method: 'GET' | 'POST' | 'DELETE',
    path: string,
  ): Promise<Response> {
    const token = await this.tokenClass.getPersonalTokenByPid(pid);
    const appOrigin = new URL(env('BASE_URL')).origin;

    const response = await fetch(`${appOrigin}/accessmanagement/api/v1/maskinporten/${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed ${method} maskinporten/${path} for "${pid}". Status: ${response.status}. Response: ${await response.text()}`,
      );
    }

    return response;
  }
}
