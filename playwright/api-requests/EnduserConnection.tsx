import { Token } from './Token';
import { env } from 'playwright/util/helper';

export class EnduserConnection {
  private tokenClass: Token;

  constructor() {
    this.tokenClass = new Token();
  }

  /**
   * Fetches connection details between a source organization and a target user.
   *
   * Resolves party UUIDs for the provided `from` organization and `to` user, then queries
   * the connections endpoint using a personal token bound to `pid`.
   *
   * @param pid - PID used to acquire an Altinn Personal token.
   * @param from - Organization number used to resolve the source party UUID.
   * @param to - PID used to resolve the target party UUID.
   * @returns A promise resolving to the JSON response from the connections endpoint.
   * @throws Error when the HTTP response is not OK.
   */
  public async getConnectionPerson(pid: string, from: string, to: string) {
    const fromUuid = await this.tokenClass.getPartyUuid(from);
    const toUuid = await this.tokenClass.getPartyUuid(to);
    const url = `${env('API_BASE_URL')}/accessmanagement/api/v1/enduser/connections?party=${fromUuid}&from=${fromUuid}&to=${toUuid}`;
    const token = await this.tokenClass.getPersonalTokenByPid(pid);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch status for addConnection request. Status: ${response.status}`,
      );
    }

    return response.json();
  }

  /**
   * Adds a connection person to the specified party by issuing a POST request to the access management API.
   *
   * @param pid - The PID used to acquire an Altinn token.
   * @param fromOrg - The organization number used to resolve the party UUID for the connection.
   * @param toPid - The PID of the connection being added.
   * @param toLastName - The last name of the connection being added.
   * @returns A promise resolving to the JSON response from the API.
   * @throws Error if the request fails or returns a non-OK HTTP status.
   */
  public async addConnectionPerson(pid: string, fromOrg: string, toPid: string) {
    const fromUuid = await this.tokenClass.getPartyUuid(fromOrg);
    const toLastName = await this.tokenClass.getLastName(toPid);
    const url = `${env('API_BASE_URL')}/accessmanagement/api/v1/enduser/connections?party=${fromUuid}&from=${fromUuid}`;
    const token = await this.tokenClass.getPersonalTokenByPid(pid);
    const payload = {
      personidentifier: toPid,
      lastName: toLastName,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch status for addConnection request. Status: ${response.status}`,
      );
    }

    return response.json();
  }

  /**
   * Deletes an end-user connection between two parties by resolving their UUIDs and issuing a DELETE request.
   *
   * @param pid - The PID used to obtain an authorization token.
   * @param Org - The party identifier representing the source party.
   * @param toPid - The party identifier representing the target party.
   * @returns A promise that resolves to the fetch response.
   * @throws If the DELETE request fails or returns a non-OK status.
   */
  public async deleteConnectionPerson(pid: string, fromOrg: string, toPid: string) {
    const fromUuid = await this.tokenClass.getPartyUuid(fromOrg);
    const toUuid = await this.tokenClass.getPartyUuid(toPid);
    const url = `${env('API_BASE_URL')}/accessmanagement/api/v1/enduser/connections?party=${fromUuid}&from=${fromUuid}&to=${toUuid}&cascade=true`;
    const token = await this.tokenClass.getPersonalTokenByPid(pid);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch status for addConnection request. Status: ${response.status}`,
      );
    }

    return response;
  }

  /**
   * Adds an access package connection from one party to another person.
   *
   * Resolves party UUIDs and the recipient's last name, builds the access package
   * request URL, and submits a POST request with the recipient details.
   *
   * @param pid - The PID used to acquire the access token.
   * @param fromOrg - The organization number used to resolve the "from" party UUID.
   * @param toPid - The recipient's PID used to resolve the "to" party UUID and last name.
   * @param packageName - The access package name to be granted.
   * @returns A promise resolving to the API response JSON payload.
   * @throws If the API response status is not OK.
   */
  public async addConnectionPackagePerson(
    pid: string,
    fromOrg: string,
    toPid: string,
    packageName: string,
  ) {
    const fromUuid = await this.tokenClass.getPartyUuid(fromOrg);
    const toPerson = await this.tokenClass.getIds(toPid);
    const toUuid = toPerson.partyUuid;
    const toLastName = toPerson.lastName;
    const token = await this.tokenClass.getPersonalTokenByPid(pid);
    const payload = {
      personidentifier: toPid,
      lastName: toLastName,
    };
    const url = `${env('API_BASE_URL')}/accessmanagement/api/v1/enduser/connections/accesspackages?party=${fromUuid}&from=${fromUuid}&to=${toUuid}&packageId&package=${packageName}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch status for addConnectionPersonPackage request. Status: ${response.status}`,
      );
    }

    return response.json();
  }

  /**
   * Deletes an access package connection between two parties for a person.
   *
   * @param pid - PID used to obtain an authorization token.
   * @param fromOrg - Organization number representing the source party.
   * @param toPid - PID for the target party.
   * @param packageName - Name of the access package to delete.
   * @returns A promise that resolves with the HTTP response from the delete request.
   * @throws If the DELETE request fails or returns a non-OK status.
   */
  public async deleteConnectionPackagePerson(
    pid: string,
    fromOrg: string,
    toPid: string,
    packageName: string,
  ) {
    const fromUuid = await this.tokenClass.getPartyUuid(fromOrg);
    const toUuid = await this.tokenClass.getPartyUuid(toPid);
    const url = `${env('API_BASE_URL')}/accessmanagement/api/v1/enduser/connections/accesspackages?party=${fromUuid}&from=${fromUuid}&to=${toUuid}&packageId&package=${packageName}`;
    const token = await this.tokenClass.getPersonalTokenByPid(pid);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch status for addConnectionPersonPackage request. Status: ${response.status}`,
      );
    }

    return response;
  }
}
