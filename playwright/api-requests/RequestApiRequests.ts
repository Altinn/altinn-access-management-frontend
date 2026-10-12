import { AltinnApi } from './AltinnApi';
import { appUrl, type HttpMethod, type Query } from './apiRequest';

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
export class RequestApiRequests extends AltinnApi {
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
    return this.request(requesterPid, 'POST', 'package', {
      party: await this.partyUuid(requesterPid),
      to: await this.partyUuid(toOrgOrPid),
      package: packageUrn,
    });
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
    return this.request(requesterPid, 'POST', 'resource', {
      party: await this.partyUuid(requesterPid),
      to: await this.partyUuid(toOrgOrPid),
      resource: resourceId,
    });
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
    const requests = await this.request<RequestDto[]>(pid, 'GET', 'received', {
      party: await this.partyUuid(partyOrgOrPid),
      status: statuses,
    });
    return requests ?? [];
  }

  /** Requests the party has sent and not yet had answered. */
  public async getSentRequests(
    pid: string,
    partyOrgOrPid: string,
    statuses: RequestStatus[] = ['Pending'],
  ): Promise<RequestDto[]> {
    const requests = await this.request<RequestDto[]>(pid, 'GET', 'sent', {
      party: await this.partyUuid(partyOrgOrPid),
      status: statuses,
    });
    return requests ?? [];
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
    await this.request(pid, 'PUT', 'received/approve', {
      party: await this.partyUuid(partyOrgOrPid),
      id: requestId,
    });
  }

  /** Rejects a received request. */
  public async rejectRequest(pid: string, partyOrgOrPid: string, requestId: string): Promise<void> {
    await this.request(pid, 'PUT', 'received/reject', {
      party: await this.partyUuid(partyOrgOrPid),
      id: requestId,
    });
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
    await this.request(pid, 'DELETE', 'sent/withdraw', {
      party: await this.partyUuid(partyOrgOrPid),
      id: requestId,
    });
  }

  /**
   * Withdraws every pending request the requester has sent to a party.
   *
   * Cleanup helper: a request left pending would otherwise show up in the next
   * run's list and break assertions that count what is waiting.
   */
  public async withdrawAllPendingRequests(requesterPid: string, toOrgOrPid: string): Promise<void> {
    const toUuid = await this.partyUuid(toOrgOrPid);
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
  private request<T>(pid: string, method: HttpMethod, path: string, query: Query): Promise<T> {
    return this.asUser<T>(pid, method, appUrl(`accessmanagement/api/v1/request/${path}`, query));
  }
}
