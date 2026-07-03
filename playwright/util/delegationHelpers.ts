import type { EnduserConnection } from 'playwright/api-requests/EnduserConnection';

/** Partene i en kobling: hvem som utfører, avgiver og mottaker. */
export interface ConnectionRef {
  /** PID til den som utfører oppryddingen (typisk avgiver / daglig leder). */
  pid: string;
  /** Avgiver-parten (pid eller orgnr). */
  from: string;
  /** Mottaker-parten (pid eller orgnr). */
  to: string;
}

/* -------------------------------------------------------------------------- */
/* Oppsett (beforeEach)                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Oppretter kobling + enkelttjeneste-delegering — utgangspunktet «slett»-testene
 * trenger (noe å slette). (En enkel kobling settes opp direkte med
 * `api.addConnection`, som allerede er kortfattet.)
 */
export async function setupServiceDelegation(
  api: EnduserConnection,
  ref: ConnectionRef,
  service: string,
): Promise<void> {
  await api.addConnection(ref.pid, ref.from, ref.to);
  await api.delegateSingleService(ref.pid, ref.from, ref.to, service);
}

/**
 * Oppretter kobling + delegerer tilgangspakker fra `from` til `to` — utgangspunkt
 * for tester som trenger at mottakeren allerede har pakker/rolle.
 */
export async function setupPackagesForUser(
  api: EnduserConnection,
  ref: ConnectionRef,
  packages: string[],
): Promise<void> {
  await api.addConnectionAndPackagesToUser(ref.pid, ref.from, ref.to, packages);
}

/* -------------------------------------------------------------------------- */
/* Opprydding (afterEach)                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Best-effort opprydding for delegerings-tester. Alle funksjonene svelger og
 * logger feil, så opprydding aldri velter en test, og holder `afterEach` små.
 */

/** Sletter koblingen mellom `from` og `to`. */
export async function cleanupConnection(api: EnduserConnection, ref: ConnectionRef): Promise<void> {
  try {
    await api.deleteConnection(ref.pid, ref.from, [ref.to]);
  } catch (error) {
    console.error('Cleanup: failed to delete connection:', error);
  }
}

/**
 * Sletter en enkelttjeneste-delegering og koblingen mellom partene.
 * @param opts.skipService Hopp over å slette enkelttjenesten (f.eks. når testen
 *   allerede har slettet den i UI ved suksess) — koblingen slettes uansett.
 */
export async function cleanupServiceDelegation(
  api: EnduserConnection,
  ref: ConnectionRef,
  service: string,
  opts: { skipService?: boolean } = {},
): Promise<void> {
  if (!opts.skipService) {
    try {
      await api.deleteSingleServiceDelegation(ref.pid, ref.from, ref.to, service);
    } catch (error) {
      console.error('Cleanup: failed to delete single service delegation:', error);
    }
  }
  await cleanupConnection(api, ref);
}

/**
 * Sletter en tilgangspakke-delegering og koblingen mellom partene.
 * @param opts.skipPackage Hopp over å slette tilgangspakken (f.eks. når testen
 *   allerede har slettet den i UI ved suksess) — koblingen slettes uansett.
 */
export async function cleanupPackageDelegation(
  api: EnduserConnection,
  ref: ConnectionRef,
  packageUrn: string,
  opts: { skipPackage?: boolean } = {},
): Promise<void> {
  if (!opts.skipPackage) {
    try {
      await api.deleteAccessPackageDelegation(ref.pid, ref.from, ref.to, packageUrn);
    } catch (error) {
      console.error('Cleanup: failed to delete access package delegation:', error);
    }
  }
  await cleanupConnection(api, ref);
}

/** Sletter en klientdelegerings-agent (klientadministrasjon). */
export async function cleanupClientDelegationAgent(
  api: EnduserConnection,
  pid: string,
  org: string,
  agentPid: string,
): Promise<void> {
  try {
    await api.deleteClientDelegationAgent(pid, org, agentPid);
  } catch (error) {
    console.error('Cleanup: failed to delete client delegation agent:', error);
  }
}
