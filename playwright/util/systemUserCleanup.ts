import { ApiRequests } from 'playwright/api-requests/SystemUserApiRequests';

export interface SystemUserCleanupParams {
  vendorOrgNumber: string;
  /** Org.nr. til virksomheten systembrukeren tilhører. */
  ownerOrg: string;
  /** PID til noen som kan slette systembrukeren (typisk daglig leder). */
  ownerPid: string;
  /** `agent` for klientdelegerings-systembrukere, ellers `regular` (default). */
  type?: 'regular' | 'agent';
  /** Sett hvis testen opprettet systemet i systemregisteret og det skal fjernes. */
  systemName?: string;

  // Oppgi ENTEN en kjent systembruker-ID (regular), ELLER systemId + externalRef
  // så vi kan slå den opp.
  systemUserId?: string;
  systemId?: string;
  externalRef?: string;
}

/**
 * Felles opprydding for systembruker-tester. Sletter systembrukeren via API (så
 * ingen systembruker lekker etter kjøringen) og fjerner eventuelt systemet fra
 * systemregisteret. All opprydding er «best effort»: feil svelges (og logges der
 * det er reelt), og en systembruker som allerede er borte gir ingen støy —
 * opprydding skal aldri velte en test.
 *
 * Kall den fra `afterEach` i alle systembruker-testene, UNNTATT testen som
 * faktisk tester sletting av systembruker.
 */
export async function cleanupSystemUser(params: SystemUserCleanupParams): Promise<void> {
  const api = new ApiRequests();
  const {
    vendorOrgNumber,
    ownerOrg,
    ownerPid,
    type = 'regular',
    systemName,
    systemUserId,
    systemId,
    externalRef,
  } = params;

  if (type === 'agent') {
    // Agent-endepunktet slår opp brukeren selv (systemId + externalRef).
    if (systemId && externalRef) {
      try {
        await api.deleteAgentSystemUser(vendorOrgNumber, systemId, ownerOrg, externalRef, ownerPid);
      } catch {
        // Ingen agent-systembruker å slette (f.eks. allerede slettet i testen).
      }
    }
  } else {
    let id = systemUserId;
    if (!id && systemId && externalRef) {
      try {
        id = await api.getSystemUserByQuery(vendorOrgNumber, systemId, ownerOrg, externalRef);
      } catch {
        // Ingen systembruker matcher — ingenting å rydde.
      }
    }
    if (id) {
      try {
        await api.cleanUpSystemUsers([{ id }], ownerPid, ownerOrg);
      } catch (error) {
        console.error('Cleanup: failed to delete system user:', error);
      }
    }
  }

  if (systemName) {
    try {
      await api.deleteSystemInSystemRegister(vendorOrgNumber, systemName);
    } catch (error) {
      console.error('Cleanup: failed to delete system from register:', error);
    }
  }
}
