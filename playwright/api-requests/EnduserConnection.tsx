import { asUser, partyUuid, token } from './callAs';
import { platformUrl, type Query } from './apiRequest';

const ENDUSER = 'accessmanagement/api/v1/enduser';

const isPerson = (pidOrOrgNo: string) => pidOrOrgNo.length === 11;

/**
 * Connections (rettighetshavere), access packages, single services and client delegations,
 * set up through the enduser API on the platform host.
 *
 * Every method takes `pid` first: the person whose personal token makes the call. `from`/`to`
 * are PIDs or organisation numbers — party UUIDs are looked up (and cached) by `Token`.
 */
export class EnduserConnection {
  /**
   * The "from"-person/organization adds the "to"-person/organization as a user, then delegates the accesspackages to this new user.
   *
   * @param packageNames - e.g. ['urn:altinn:accesspackage:tilgangsstyrer', 'urn:altinn:accesspackage:posttjenester']
   */
  public async addConnectionAndPackagesToUser(
    pid: string,
    from: string,
    to: string,
    packageNames: string[],
  ) {
    await this.addConnection(pid, from, to);
    if (isPerson(to)) {
      await this.addPackagePerson(pid, from, to, packageNames);
    } else {
      await this.addPackageOrg(pid, from, to, packageNames);
    }
  }

  /** Connection details between `fromOrg` and the person `to`. */
  public async getConnectionPerson(pid: string, fromOrg: string, to: string) {
    const from = await partyUuid(fromOrg);
    return asUser(
      pid,
      'GET',
      platformUrl(`${ENDUSER}/connections`, {
        party: from,
        from,
        to: await partyUuid(to),
      }),
    );
  }

  /** Adds `to` (PID or organisation number) as a user (rettighetshaver) of `from`. */
  public async addConnection(pid: string, from: string, to: string) {
    const fromUuid = await partyUuid(from);
    if (isPerson(to)) {
      return asUser(pid, 'POST', platformUrl(`${ENDUSER}/connections`, this.fromSelf(fromUuid)), {
        json: await this.personPayload(to),
      });
    }
    return asUser(
      pid,
      'POST',
      platformUrl(`${ENDUSER}/connections`, {
        ...this.fromSelf(fromUuid),
        to: await partyUuid(to),
      }),
    );
  }

  /** Removes the connection from `from` to each of `toList`, including everything delegated over it. */
  public async deleteConnection(pid: string, from: string, toList: string[]) {
    const fromUuid = await partyUuid(from);
    await Promise.all(
      toList.map(async (to) =>
        asUser(
          pid,
          'DELETE',
          platformUrl(`${ENDUSER}/connections`, {
            ...this.fromSelf(fromUuid),
            to: await partyUuid(to),
            cascade: true,
          }),
        ),
      ),
    );
  }

  /** Delegates the access packages from `fromOrg` to the person `toPid`. */
  public async addPackagePerson(
    pid: string,
    fromOrg: string,
    toPid: string,
    packageNames: string[],
  ) {
    const query = await this.fromTo(fromOrg, toPid);
    const json = await this.personPayload(toPid);
    await Promise.all(
      packageNames.map((packageName) =>
        asUser(
          pid,
          'POST',
          platformUrl(`${ENDUSER}/connections/accesspackages`, { ...query, package: packageName }),
          { json },
        ),
      ),
    );
  }

  /** Delegates the access packages from `from` to the organisation `toOrgNo`, one at a time. */
  public async addPackageOrg(pid: string, from: string, toOrgNo: string, packageNames: string[]) {
    const query = await this.fromTo(from, toOrgNo);
    for (const packageName of packageNames) {
      await asUser(
        pid,
        'POST',
        platformUrl(`${ENDUSER}/connections/accesspackages`, { ...query, package: packageName }),
      );
    }
  }

  public async deleteAccessPackageDelegation(
    pid: string,
    fromOrg: string,
    toPid: string,
    packageName: string,
  ) {
    await asUser(
      pid,
      'DELETE',
      platformUrl(`${ENDUSER}/connections/accesspackages`, {
        ...(await this.fromTo(fromOrg, toPid)),
        package: packageName,
      }),
    );
  }

  /**
   * Delegerer enkelttjenesten `resource` fra `from` til `to`, med leserettigheter hvis ikke `action` er oppgitt.
   *
   * @param action - Hvilken handling mottakeren skal få rettighet til (f.eks. 'Read', 'Write', 'Sign').
   */
  public async delegateSingleService(
    pid: string,
    from: string,
    to: string,
    resource: string,
    action = 'Read',
  ) {
    const { rights } = await this.getResourceDelegationcheck(pid, pid, resource);
    const right = rights.find((element) => element.right.name === action);
    if (!right) {
      throw new Error(`"${resource}" has no delegable right "${action}" for "${pid}".`);
    }

    await asUser(
      pid,
      'POST',
      platformUrl(`${ENDUSER}/connections/resources/rights`, {
        party: await partyUuid(from),
        to: await partyUuid(to),
        resource,
      }),
      { json: { directRightKeys: [right.right.key] } },
    );
  }

  /** Sletter delegeringen av enkelttjenesten `resource` fra `from` til `to`. */
  public async deleteSingleServiceDelegation(
    pid: string,
    from: string,
    to: string,
    resource: string,
  ) {
    await asUser(
      pid,
      'DELETE',
      platformUrl(`${ENDUSER}/connections/resources`, {
        ...(await this.fromTo(from, to)),
        resource,
      }),
    );
  }

  /** Hvilke rettigheter `party` har lov til å delegere for tjenesten `resource`. */
  public async getResourceDelegationcheck(pid: string, party: string, resource: string) {
    return asUser<{ rights: { right: { name: string; key: string } }[] }>(
      pid,
      'GET',
      platformUrl(`${ENDUSER}/connections/resources/delegationcheck`, {
        party: await partyUuid(party),
        resource,
      }),
    );
  }

  /** Adds the person `agentPid` as a client administration agent (klientbruker) of `fromParty`. */
  public async addClientDelegationAgent(pid: string, fromParty: string, agentPid: string) {
    await asUser(
      pid,
      'POST',
      platformUrl(`${ENDUSER}/clientdelegations/agents`, {
        party: await partyUuid(fromParty),
      }),
      { json: await this.personPayload(agentPid) },
    );
  }

  public async deleteClientDelegationAgent(pid: string, fromParty: string, agentPid: string) {
    await asUser(
      pid,
      'DELETE',
      platformUrl(`${ENDUSER}/clientdelegations/agents`, {
        party: await partyUuid(fromParty),
        to: await partyUuid(agentPid),
      }),
      { json: await this.personPayload(agentPid) },
    );
  }

  public async getClientDelegationAgents(pid: string, fromParty: string) {
    return asUser(
      pid,
      'GET',
      platformUrl(`${ENDUSER}/clientdelegations/agents`, {
        party: await partyUuid(fromParty),
      }),
    );
  }

  /** Gives the agent `agentPid` the access package `packageName` for the client `clientOrgNo`. */
  public async delegerKlientTilBruker(
    pid: string,
    fromParty: string,
    clientOrgNo: string,
    agentPid: string,
    packageName: string,
  ) {
    await asUser(
      pid,
      'POST',
      platformUrl(`${ENDUSER}/clientdelegations/agents/accesspackages`, {
        party: await partyUuid(fromParty),
        from: await partyUuid(clientOrgNo),
        to: await partyUuid(agentPid),
      }),
      { json: { values: [{ role: 'rettighetshaver', packages: [packageName] }] } },
    );
  }

  /** The acting party is the one delegating: `party` and `from` are the same. */
  private fromSelf(fromUuid: string): Query {
    return { party: fromUuid, from: fromUuid };
  }

  private async fromTo(from: string, to: string): Promise<Query> {
    return { ...this.fromSelf(await partyUuid(from)), to: await partyUuid(to) };
  }

  /** A person is added by identifier and last name, as in the UI's "Legg til person". */
  private async personPayload(pid: string) {
    return { personidentifier: pid, lastName: await token.getLastName(pid) };
  }
}
