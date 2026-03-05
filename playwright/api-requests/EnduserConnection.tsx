import { Token } from './Token';
import { env } from 'playwright/util/helper';

export class EnduserConnection {
  private tokenClass: Token;

  constructor() {
    this.tokenClass = new Token();
  }

  /**
   * The "from"-person/organization adds the "to"-person/organization as a user, then delegates the accesspackages to this new user.
   *
   * @param pid - PID used to acquire an Altinn Personal tokens.
   * @param from - PID or Organization number that is adding a new user/connection.
   * @param to - The target PID or organization number that is being added as a new user/connection.
   * @param packageNames - The package names to add for the connected user. e.g. ['urn:altinn:accesspackage:tilgangsstyrer', 'urn:altinn:accesspackage:posttjenester', 'urn:altinn:accesspackage:byggesoknad',]
   */
  public async addConnectionAndPackagesToUser(
    pid: string,
    from: string,
    to: string,
    packageNames: Array<string>,
  ) {
    const thing = [
      'urn:altinn:accesspackage:tilgangsstyrer',
      'urn:altinn:accesspackage:posttjenester',
      'urn:altinn:accesspackage:byggesoknad',
    ];
    const fromUuid = await this.tokenClass.getPartyUuid(from);
    const toIds = await this.tokenClass.getIds(to);

    await this.addConnection(pid, from, to, fromUuid, toIds.lastName);

    if (to.length == 11) {
      await this.addPackagePerson(
        pid,
        from,
        to,
        packageNames,
        fromUuid,
        toIds.partyUuid,
        toIds.lastName,
      );
    } else {
      await this.addPackageOrg(pid, from, to, packageNames, fromUuid, toIds.partyUuid);
    }
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
   * @param from - The PID or organization number used to resolve the party UUID for the connection.
   * @param to - The PID or organization number of the connection being added.
   * @param fromUuid - The from's partyUuid.
   * @param toLastName - the last name for the connection being added.
   * @param toUuid - the to's partyUuid.
   * @returns A promise resolving to the JSON response from the API.
   * @throws Error if the request fails or returns a non-OK HTTP status.
   */
  public async addConnection(
    pid: string,
    from: string,
    to: string,
    fromUuid?: string,
    toLastName?: string,
    toUuid?: string,
  ) {
    const token = await this.tokenClass.getPersonalTokenByPid(pid);
    let url;
    let payload;
    let response;
    fromUuid = fromUuid || (await this.tokenClass.getPartyUuid(from));
    if (to.length == 11) {
      toLastName = toLastName || (await this.tokenClass.getLastName(to));
      url = `${env('API_BASE_URL')}/accessmanagement/api/v1/enduser/connections?party=${fromUuid}&from=${fromUuid}`;
      payload = {
        personidentifier: to,
        lastName: toLastName,
      };
      response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } else {
      toUuid = toUuid || (await this.tokenClass.getPartyUuid(to));
      url = `${env('API_BASE_URL')}/accessmanagement/api/v1/enduser/connections?party=${fromUuid}&from=${fromUuid}&to=${toUuid}`;
      response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    }

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
   * @param from - The party identifier representing the source party.
   * @param toList - An array of PIDs whose connections are to be deleted.
   * @returns A promise that resolves to the fetch response.
   */
  public async deleteConnection(pid: string, from: string, toList: Array<string>) {
    const fromUuid = await this.tokenClass.getPartyUuid(from);
    const token = await this.tokenClass.getPersonalTokenByPid(pid);
    let responses = new Array<Response>();

    toList.forEach(async (to) => {
      const toUuid = await this.tokenClass.getPartyUuid(to);

      const url = `${env('API_BASE_URL')}/accessmanagement/api/v1/enduser/connections?party=${fromUuid}&from=${fromUuid}&to=${toUuid}&cascade=true`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn(
          `Failed to fetch status for deleteConnectionPerson request. Status: ${response.status}`,
        );
        responses.push(response);
      }
    });

    return responses;
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
   */
  public async addPackagePerson(
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
   * Adds an access package connection from one party to another organization.
   *
   * Resolves party UUIDs, builds the access package
   * request URL, and submits a POST request with the recipient details.
   *
   * @param pid - The PID used to acquire the access token.
   * @param from - The PID or organization number used to resolve the "from" party UUID.
   * @param toOrg - The recipient's organization number used to resolve the "to" party UUID.
   * @param packageName - The access package name to be granted.
   * @param fromUuid - The organization's partyUuid.
   * @param toUuid - the partyUuid of the connection being added.
   * @returns A promise resolving to the API response JSON payload.
   */
  public async addPackageOrg(
    pid: string,
    from: string,
    toOrgNo: string,
    packageNames: Array<string>,
    fromUuid?: string,
    toUuid?: string,
  ) {
    fromUuid = fromUuid || (await this.tokenClass.getPartyUuid(from));
    toUuid = toUuid || (await this.tokenClass.getPartyUuid(toOrgNo));
    const token = await this.tokenClass.getPersonalTokenByPid(pid);
    var responses = new Array<Response>();
    packageNames.forEach(async (packageName) => {
      const url = `${env('API_BASE_URL')}/accessmanagement/api/v1/enduser/connections/accesspackages?party=${fromUuid}&from=${fromUuid}&to=${toUuid}&package=${packageName}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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
