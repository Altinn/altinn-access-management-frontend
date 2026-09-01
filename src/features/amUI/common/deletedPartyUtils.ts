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

  return children.reduce<ConnectionChild[]>((acc, child) => {
    const grandChildren = filterDeletedChildren(child.children);
    if (!child.isDeleted || (grandChildren?.length ?? 0) > 0) {
      acc.push({ ...child, children: grandChildren });
    }
    return acc;
  }, []);
};

/**
 * Removes items whose party is deleted, for flat lists such as clients and agents.
 * `getParty` points at the party of an item, e.g. `(client) => client.client`.
 */
export const filterDeletedParties = <T>(
  items: T[] | undefined,
  getParty: (item: T) => DeletableParty | null | undefined,
): T[] => items?.filter((item) => !getParty(item)?.isDeleted) ?? [];

/**
 * Removes deleted parties from a connection tree.
 *
 * A deleted party is kept when it still has non-deleted parties below it, so that access
 * held through an active subunit isn't hidden along with its deleted main unit.
 */
export const filterDeletedConnections = (connections: Connection[]): Connection[] =>
  connections.reduce<Connection[]>((acc, connection) => {
    const nestedConnections = filterDeletedConnections(connection.connections ?? []);
    const children = filterDeletedChildren(connection.party.children);
    const hasVisibleDescendants = nestedConnections.length > 0 || (children?.length ?? 0) > 0;

    if (!connection.party.isDeleted || hasVisibleDescendants) {
      acc.push({
        ...connection,
        party: { ...connection.party, children },
        connections: nestedConnections,
      });
    }
    return acc;
  }, []);
