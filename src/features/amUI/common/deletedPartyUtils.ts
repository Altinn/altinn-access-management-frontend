import type { Connection } from '@/rtk/features/connectionApi';
import type { ExtendedUser, User } from '@/rtk/features/userInfoApi';

type DeletableParty = { isDeleted?: boolean | null };

type ConnectionChild = ExtendedUser | User;

const filterDeletedChildren = (
  children: ConnectionChild[] | null | undefined,
): ConnectionChild[] | null => {
  if (!children) {
    return null;
  }

  return children
    .filter((child) => !child.isDeleted)
    .map((child) => ({ ...child, children: filterDeletedChildren(child.children) }));
};

/**
 * Removes items whose party is deleted, for flat lists such as clients and agents.
 * `getParty` points at the party of an item, e.g. `(client) => client.client`.
 */
export const filterDeletedParties = <T>(
  items: T[] | undefined,
  getParty: (item: T) => DeletableParty | null | undefined,
): T[] => items?.filter((item) => !getParty(item)?.isDeleted) ?? [];

/** Removes deleted parties. */
export const filterDeletedConnections = (connections: Connection[]): Connection[] =>
  connections
    .filter((connection) => !connection.party.isDeleted)
    .map((connection) => ({
      ...connection,
      party: { ...connection.party, children: filterDeletedChildren(connection.party.children) },
      connections: filterDeletedConnections(connection.connections ?? []),
    }));
