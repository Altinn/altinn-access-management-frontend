import type { PartyType } from '@/dataObjects/dtos/Party';
import type { ActionError } from '@/resources/hooks/useActionError';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

export type ClientAccessMode = 'delegate' | 'remove';

/** The agent who holds, or would receive, the access. */
export type ClientAccessRecipient = {
  id: string;
  name: string;
  type?: PartyType;
};

type ClientAccessEntryBase = {
  /** Unique within one list: the row's DOM id and RestoreFocus target. */
  itemId: string;
  clientId: string;
  recipient: ClientAccessRecipient;
  roleCode: string;
  /** The id sent to the API: the package urn or the resource refId. */
  accessId: string;
  roleDescription?: string;
  /** Whether this access can be delegated or removed from here at all. */
  canAct: boolean;
};

/** One access package or resource that a client can delegate to an agent. */
export type ClientAccessEntry = ClientAccessEntryBase &
  (
    | { kind: 'package'; accessPackage: AccessPackage }
    | { kind: 'resource'; resource: ServiceResource }
  );

export type ClientAccessResult = { ok: true } | { ok: false; error?: ActionError };

export type RunClientAccessAction = (
  mode: ClientAccessMode,
  entry: ClientAccessEntry,
) => Promise<ClientAccessResult>;

export const getAccessName = (entry: ClientAccessEntry) =>
  entry.kind === 'package' ? entry.accessPackage.name : entry.resource.title;
