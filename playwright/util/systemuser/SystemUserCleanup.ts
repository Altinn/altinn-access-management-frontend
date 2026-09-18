import { randomUUID } from 'node:crypto';

import { Token } from 'playwright/api-requests/Token';
import { env } from 'playwright/util/helper';

export interface SystemUserOwner {
  orgNo: string;
  pid: string;
}

export type SystemUserKind = 'standard' | 'agent';
export interface StoredSystemUser {
  id: string;
  systemId: string;
  created: string;
}

interface TrackedSystem {
  name: string;
  id: string;
  vendorOrgNo: string;
  owner: SystemUserOwner;
  kind: SystemUserKind;
}

/** Deletes only users of systems registered by this test, including after failed setup. */
export class SystemUserCleanup {
  private readonly systems: TrackedSystem[] = [];
  private readonly token = new Token();

  track(
    owner: SystemUserOwner,
    vendorOrgNo: string,
    feature: string,
    kind: SystemUserKind = 'standard',
  ) {
    const name = `Playwright-e2e-${feature}-${Date.now()}-${randomUUID().slice(0, 8)}`;
    const system = { name, id: `${vendorOrgNo}_${name}`, vendorOrgNo, owner, kind };
    // Register before POST: setup may fail after the server has created the system/user.
    this.systems.push(system);
    return system;
  }

  private async ownerAccess(owner: SystemUserOwner) {
    const party = await this.token.getIds(owner.orgNo);
    const token = await this.token.getPersonalTokenByPid(owner.pid);
    return { party, headers: { Authorization: `Bearer ${token}` } };
  }

  async list(owner: SystemUserOwner, kind: SystemUserKind): Promise<StoredSystemUser[]> {
    const { party, headers } = await this.ownerAccess(owner);
    const path = kind === 'agent' ? `agent/${party.partyId}` : `${party.partyId}`;
    const response = await fetch(
      `${env('API_BASE_URL')}/authentication/api/v1/systemuser/${path}`,
      {
        headers,
        signal: AbortSignal.timeout(30_000),
      },
    );
    if (!response.ok) throw new Error(`List ${kind} system users failed: HTTP ${response.status}`);
    const users: unknown = await response.json();
    if (
      !Array.isArray(users) ||
      users.some(
        (user) =>
          typeof user?.id !== 'string' ||
          typeof user?.systemId !== 'string' ||
          !user.id ||
          !user.systemId,
      )
    ) {
      throw new Error('Invalid system user list; cleanup stopped.');
    }
    return users;
  }

  async remove(owner: SystemUserOwner, kind: SystemUserKind, id: string) {
    const { party, headers } = await this.ownerAccess(owner);
    const path =
      kind === 'agent'
        ? `agent/${party.partyId}/${encodeURIComponent(id)}?partyuuid=${party.partyUuid}`
        : `${party.partyId}/${encodeURIComponent(id)}`;
    await this.delete(`/authentication/api/v1/systemuser/${path}`, headers);
  }

  private async delete(path: string, headers: Record<string, string>) {
    const response = await fetch(`${env('API_BASE_URL')}${path}`, {
      method: 'DELETE',
      headers,
      signal: AbortSignal.timeout(30_000),
    });
    // The UI or an earlier cleanup attempt may already have deleted it.
    if (!response.ok && response.status !== 404) {
      throw new Error(`Cleanup ${path} failed: HTTP ${response.status}`);
    }
  }

  async cleanup() {
    const errors: unknown[] = [];
    for (const system of this.systems) {
      try {
        const users = (await this.list(system.owner, system.kind)).filter(
          (user) => user.systemId === system.id,
        );
        const failures: unknown[] = [];
        for (const user of users) {
          try {
            await this.remove(system.owner, system.kind, user.id);
          } catch (error) {
            failures.push(error);
          }
        }
        if (failures.length) throw new AggregateError(failures, `Failed to clean ${system.id}`);
        // Keep the registered system if deleting its users failed, so it remains repairable.
        const token = await this.token.getEnterpriseAltinnToken(
          system.vendorOrgNo,
          'altinn:authentication/systemregister.write',
        );
        await this.delete(
          `/authentication/api/v1/systemregister/vendor/${encodeURIComponent(system.id)}`,
          {
            Authorization: `Bearer ${token}`,
          },
        );
      } catch (error) {
        errors.push(error);
      }
    }
    if (errors.length) {
      const details = errors
        .map((error) => (error instanceof Error ? error.message : String(error)))
        .join('; ');
      throw new AggregateError(errors, `System user test data cleanup failed: ${details}`);
    }
  }
}
