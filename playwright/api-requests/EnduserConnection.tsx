import { Token } from './Token';
import { env } from 'playwright/util/helper';

export class EnduserConnection {
  private tokenClass: Token;

  constructor() {
    this.tokenClass = new Token();
  }

  /**
   * Adds a connection between a person and an organization, then assigns the specified packages.
   *
   * @param pid - PID used to acquire an Altinn Personal tokens.
   * @param fromOrg - Organization number used to resolve the source party UUID.
   * @param toPid - The target PID to connect to.
   * @param packageNames - The package names to add for the connected person.
   */
  public async addConnectionAndPackagesToPerson(
    pid: string,
    fromOrg: string,
    toPid: string,
    packageNames: Array<string>,
  ) {
    const fromUuid = await this.tokenClass.getPartyUuid(fromOrg);
    const toPerson = await this.tokenClass.getIds(toPid);

    await this.addConnectionPerson(pid, fromOrg, toPid, fromUuid, toPerson.lastName);
    await this.addConnectionPackagePerson(
      pid,
      fromOrg,
      toPid,
      packageNames,
      fromUuid,
      toPerson.partyUuid,
      toPerson.lastName,
    );
  }

  /**
   * Fetches connection details between a source organization and a target user.
   *
   * Resolves party UUIDs for the provided `from` organization and `to` user, then queries
   * the connections endpoint using a personal token bound to `pid`.
   *
   * @param pid - PID used to acquire an Altinn Personal token.
   * @param fromOrg - Organization number used to resolve the source party UUID.
   * @param to - PID used to resolve the target party UUID.
   * @returns A promise resolving to the JSON response from the connections endpoint.
   * @throws Error when the HTTP response is not OK.
   */
  public async getConnectionPerson(pid: string, fromOrg: string, to: string) {
    const fromUuid = await this.tokenClass.getPartyUuid(fromOrg);
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
        `Failed to fetch status for getConnectionPerson request. Status: ${response.status}`,
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
   * @param fromUuid - The organization's partyUuid.
   * @param toLastName - the last name for the connection being added
   * @returns A promise resolving to the JSON response from the API.
   * @throws Error if the request fails or returns a non-OK HTTP status.
   */
  public async addConnectionPerson(
    pid: string,
    fromOrg: string,
    toPid: string,
    fromUuid?: string,
    toLastName?: string,
  ) {
    fromUuid = fromUuid || (await this.tokenClass.getPartyUuid(fromOrg));
    toLastName = toLastName || (await this.tokenClass.getLastName(toPid));
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
        `Failed to fetch status for addConnectionPerson request. Status: ${response.status}`,
      );
    }

    return response.json();
  }

  /**
   * Deletes an end-user connection between two parties by resolving their UUIDs and issuing a DELETE request.
   *
   * @param pid - The PID used to obtain an authorization token.
   * @param fromOrg - The party identifier representing the source party.
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
        `Failed to fetch status for deleteConnectionPerson request. Status: ${response.status}`,
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
   * @param fromUuid - The organization's partyUuid.
   * @param toUuid - the partyUuid of the connection being added.
   * @param toLastName - the last name for the connection being added.
   * @returns A promise resolving to the API response JSON payload.
   * @throws If the API response status is not OK.
   */
  public async addConnectionPackagePerson(
    pid: string,
    fromOrg: string,
    toPid: string,
    packageNames: Array<string>,
    fromUuid?: string,
    toUuid?: string,
    toLastName?: string,
  ) {
    var toPerson;
    fromUuid = fromUuid || (await this.tokenClass.getPartyUuid(fromOrg));
    if (!toUuid && !toLastName) {
      toPerson = await this.tokenClass.getIds(toPid);
    }
    toUuid = toUuid || toPerson.partyUuid;
    toLastName = toLastName || toPerson.lastName;
    const token = await this.tokenClass.getPersonalTokenByPid(pid);
    const payload = {
      personidentifier: toPid,
      lastName: toLastName,
    };
    var responses = new Array<Response>();
    packageNames.forEach(async (packageName) => {
      const url = `${env('API_BASE_URL')}/accessmanagement/api/v1/enduser/connections/accesspackages?party=${fromUuid}&from=${fromUuid}&to=${toUuid}&package=${packageName}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.warn(
          `Failed to fetch status for addConnectionPackagePerson request. Status: ${response.status}`,
        );
        responses.push(response);
      }
    });

    return responses;
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
    const url = `${env('API_BASE_URL')}/accessmanagement/api/v1/enduser/connections/accesspackages?party=${fromUuid}&from=${fromUuid}&to=${toUuid}&package=${packageName}`;
    const token = await this.tokenClass.getPersonalTokenByPid(pid);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(
        `Failed to fetch status for deleteConnectionPackagePerson request. Status: ${response.status}`,
      );
    }

    return response;
  }
}
