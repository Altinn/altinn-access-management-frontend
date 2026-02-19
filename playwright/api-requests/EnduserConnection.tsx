import { ok } from 'assert';
import { Token } from './Token';
import { env } from 'playwright/util/helper';

export class EnduserConnection {
  private tokenClass: Token;

  constructor() {
    this.tokenClass = new Token();
  }

  public async packageExists(packageName: any) {
    console.log(packageName);
  }
  /**
   * Fetches connection details between a source organization and a target user.
   *
   * Resolves party UUIDs for the provided `from` organization and `to` user, then queries
   * the connections endpoint using a personal token bound to `pid`.
   *
   * @param pid - Personal identifier used to acquire an Altinn Personal token.
   * @param from - Organization number used to resolve the source party UUID.
   * @param to - User identifier used to resolve the target party UUID.
   * @returns A promise resolving to the JSON response from the connections endpoint.
   * @throws Error when the HTTP response is not OK.
   */
  public async getConnectionPerson(pid: string, from: string, to: string) {
    console.log('getConnectionPerson');
    const fromUuid = await this.tokenClass.getPartyUuid(from);
    const toUuid = await this.tokenClass.getPartyUuid(to);
    const url = `${env('API_BASE_URL')}/accessmanagement/api/v1/enduser/connections?party=${fromUuid}&from=${fromUuid}&to:${toUuid}`;
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
    console.log('after getConnectionPerson');
    return response.json();
  }

  /**
   * Adds a connection person to the specified party by issuing a POST request to the access management API.
   *
   * @param pid - The person identifier used to acquire an Altinn token.
   * @param from - The party identifier used to resolve the party UUID for the connection.
   * @param toPid - The person identifier of the connection being added.
   * @param toLastName - The last name of the connection being added.
   * @returns A promise resolving to the JSON response from the API.
   * @throws Error if the request fails or returns a non-OK HTTP status.
   */
  public async addConnectionPerson(pid: string, from: string, toPid: string, toLastName: string) {
    const fromUuid = await this.tokenClass.getPartyUuid(from);
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

  public async deleteConnectionPerson(pid: string, from: string, toPid: string) {
    const fromUuid = await this.tokenClass.getPartyUuid(from);
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
   * @param pid - The personal identifier used to acquire the access token.
   * @param from - The source party identifier used to resolve the "from" party UUID.
   * @param toPid - The recipient's personal identifier used to resolve the "to" party UUID and last name.
   * @param packageName - The access package name to be granted.
   * @returns A promise resolving to the API response JSON payload.
   * @throws If the API response status is not OK.
   */
  public async addConnectionPackagePerson(
    pid: string,
    from: string,
    toPid: string,
    packageName: string,
  ) {
    const fromUuid = await this.tokenClass.getPartyUuid(from);
    const toUuid = await this.tokenClass.getPartyUuid(toPid);
    const toLastName = await this.tokenClass.getLastName(toPid);
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
    // const url = `${env('API_BASE_URL')}/accessmanagement/api/v1/enduser/connections/accesspackages?party=${fromUuid}&from=${fromUuid}&to=${toUuid}&packageId&package=${packageName}`;

    console.log(`${toPid} got package ${packageName}`);
    return response.json();
  }

  public async deleteConnectionPackagePerson(
    pid: string,
    from: string,
    toPid: string,
    packageName: string,
  ) {
    const fromUuid = await this.tokenClass.getPartyUuid(from);
    const toUuid = await this.tokenClass.getPartyUuid(toPid);
    const toLastName = await this.tokenClass.getLastName(toPid);
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

    console.log(`${toPid} lost package ${packageName}`);
    return response;
  }
}
