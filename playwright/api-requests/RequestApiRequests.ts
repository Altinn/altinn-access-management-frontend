import { env } from 'playwright/util/helper';

import { Token } from './Token';

export type RequestStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Withdrawn';

/** A delegation request as returned by the request BFF. */
export interface RequestDto {
  id: string;
  type: string;
  status: RequestStatus;
  from: { id: string; name: string };
  to: { id: string; name: string };
  lastUpdated: string;
  resourceId?: string;
  packageId?: string;
}

/**
 * The "Forespørsler" (delegation request) endpoints.
 *
 * Direction is easy to get backwards: `party` is always the party the token acts
 * as, and for a *creation* it is the party asking for access, while `to` is the
 * party being asked to grant it. So a person asking an organisation for a
 * package passes party=<person>, to=<organisation>.
 */
export class RequestApiRequests {
  private tokenClass: Token;

  constructor() {
    this.tokenClass = new Token();
  }

  /**
   * Asks `toOrgOrPid` for an access package on behalf of `requesterPid`.
   *
   * @param requesterPid - PID of the person asking for access (token owner).
   * @param toOrgOrPid - Organisation number or PID being asked to grant it.
   * @param packageUrn - e.g. 'urn:altinn:accesspackage:posttjenester'.
   * @returns The created request, whose `id` is needed to approve/reject/withdraw it.
   */
  public async createPackageRequest(
    requesterPid: string,
    toOrgOrPid: string,
    packageUrn: string,
  ): Promise<RequestDto> {
    const requesterUuid = await this.tokenClass.getPartyUuid(requesterPid);
    const toUuid = await this.tokenClass.getPartyUuid(toOrgOrPid);

    const response = await this.request(
      requesterPid,
      'POST',
      `package?party=${requesterUuid}&to=${toUuid}&package=${encodeURIComponent(packageUrn)}`,
    );
    return response.json();
  }

  /**
   * Requests a single service (resource) instead of an access package.
   *
   * @param resourceId - The resource identifier, not URL-encoded by the caller.
   */
  public async createResourceRequest(
    requesterPid: string,
    toOrgOrPid: string,
    resourceId: string,
  ): Promise<RequestDto> {
    const requesterUuid = await this.tokenClass.getPartyUuid(requesterPid);
    const toUuid = await this.tokenClass.getPartyUuid(toOrgOrPid);

    const response = await this.request(
      requesterPid,
      'POST',
      `resource?party=${requesterUuid}&to=${toUuid}&resource=${encodeURIComponent(resourceId)}`,
    );
    return response.json();
  }

  /**
   * Requests the party has received and not yet answered.
   *
   * @param pid - PID of a user who may act for `partyOrgOrPid`.
   * @param partyOrgOrPid - The party whose received requests to list.
   */
  public async getReceivedRequests(
    pid: string,
    partyOrgOrPid: string,
    statuses: RequestStatus[] = ['Pending'],
  ): Promise<RequestDto[]> {
    const partyUuid = await this.tokenClass.getPartyUuid(partyOrgOrPid);
    const statusParams = statuses.map((status) => `&status=${status}`).join('');

    const response = await this.request(pid, 'GET', `received?party=${partyUuid}${statusParams}`);
    return response.status === 204 ? [] : response.json();
  }

  /** Requests the party has sent and not yet had answered. */
  public async getSentRequests(
    pid: string,
    partyOrgOrPid: string,
    statuses: RequestStatus[] = ['Pending'],
  ): Promise<RequestDto[]> {
    const partyUuid = await this.tokenClass.getPartyUuid(partyOrgOrPid);
    const statusParams = statuses.map((status) => `&status=${status}`).join('');

    const response = await this.request(pid, 'GET', `sent?party=${partyUuid}${statusParams}`);
    return response.status === 204 ? [] : response.json();
  }

  /**
   * Approves a received request, granting the access that was asked for.
   *
   * @param pid - PID of a user who may answer for `partyOrgOrPid`.
   * @param partyOrgOrPid - The party that received the request.
   */
  public async approveRequest(
    pid: string,
    partyOrgOrPid: string,
    requestId: string,
  ): Promise<void> {
    const partyUuid = await this.tokenClass.getPartyUuid(partyOrgOrPid);
    await this.request(pid, 'PUT', `received/approve?party=${partyUuid}&id=${requestId}`);
  }

  /** Rejects a received request. */
  public async rejectRequest(pid: string, partyOrgOrPid: string, requestId: string): Promise<void> {
    const partyUuid = await this.tokenClass.getPartyUuid(partyOrgOrPid);
    await this.request(pid, 'PUT', `received/reject?party=${partyUuid}&id=${requestId}`);
  }

  /**
   * Withdraws a request the party sent, i.e. the requester changing their mind.
   *
   * @param pid - PID of the requester.
   * @param partyOrgOrPid - The party that sent the request.
   */
  public async withdrawRequest(
    pid: string,
    partyOrgOrPid: string,
    requestId: string,
  ): Promise<void> {
    const partyUuid = await this.tokenClass.getPartyUuid(partyOrgOrPid);
    await this.request(pid, 'DELETE', `sent/withdraw?party=${partyUuid}&id=${requestId}`);
  }

  /**
   * Withdraws every pending request the requester has sent to a party.
   *
   * Cleanup helper: a request left pending would otherwise show up in the next
   * run's list and break assertions that count what is waiting.
   */
  public async withdrawAllPendingRequests(requesterPid: string, toOrgOrPid: string): Promise<void> {
    const toUuid = await this.tokenClass.getPartyUuid(toOrgOrPid);
    const pending = await this.getSentRequests(requesterPid, requesterPid, ['Pending']);

    for (const request of pending.filter((r) => r.to.id === toUuid)) {
      await this.withdrawRequest(requesterPid, requesterPid, request.id);
    }
  }

  /**
   * Issues an authenticated call against the request BFF.
   *
   * These endpoints live on the app host (BASE_URL origin), not the platform
   * host (API_BASE_URL) — same as the settings BFF.
   */
  private async request(
    pid: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
  ): Promise<Response> {
    const token = await this.tokenClass.getPersonalTokenByPid(pid);
    const appOrigin = new URL(env('BASE_URL')).origin;
    const url = `${appOrigin}/accessmanagement/api/v1/request/${path}`;

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed ${method} request/${path} for "${pid}". Status: ${response.status}. Response: ${await response.text()}`,
      );
    }

    return response;
  }
}
