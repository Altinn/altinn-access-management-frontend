import { useMemo, useState, useEffect } from 'react';

import type { ExtendedUser, User } from '@/rtk/features/userInfoApi';
import { Connection } from '@/rtk/features/connectionApi';
import { isNewUser } from '../isNewUser';

const PAGE_SIZE = 10;

interface useFilteredUsersProps {
  connections?: Connection[];
  indirectConnections?: Connection[];
  searchString: string;
}

const mapToExtendedUsers = (connections: Connection[]): ExtendedUser[] => {
  return connections.map((connection): ExtendedUser => {
    const children: (ExtendedUser | User)[] = connection.connections?.length
      ? mapToExtendedUsers(connection.connections)
      : (connection.party.children ?? []);

    const newUser = isNewUser(connection.party.addedAt);
    return {
      ...connection.party,
      roles: connection.roles,
      children,
      sortKey: `${newUser ? '0' : '1'}:${connection.sortKey}`,
    };
  });
};

const partyMatchesSearchTerm = (party: User | ExtendedUser, searchString: string): boolean => {
  const lowerCaseSearchTerm = searchString.toLocaleLowerCase();
  const nameMatch = party.name.toLowerCase().includes(lowerCaseSearchTerm);
  const orgNumberMatch = party.organizationIdentifier
    ? party.organizationIdentifier.toString().toLowerCase().includes(lowerCaseSearchTerm)
    : false;
  return nameMatch || orgNumberMatch;
};

const isExtendedUser = (user: ExtendedUser | User): user is ExtendedUser => {
  return Array.isArray((user as ExtendedUser).roles) || (user as ExtendedUser).roles !== undefined;
};

const filterUserNode = (userNode: ExtendedUser, searchString: string): ExtendedUser | null => {
  const isMatchSelf = partyMatchesSearchTerm(userNode, searchString);

  let hasMatchInChildren = false;
  let newChildren: (ExtendedUser | User)[] = [];
  if (Array.isArray(userNode.children) && userNode.children.length > 0) {
    for (const child of userNode.children) {
      if (isExtendedUser(child)) {
        const childResult = filterUserNode(child, searchString);
        if (childResult) {
          hasMatchInChildren = true;
          newChildren.push(childResult);
        } else {
          newChildren.push(child);
        }
      } else {
        const childMatches = partyMatchesSearchTerm(child, searchString);
        if (childMatches) {
          hasMatchInChildren = true;
        }
        newChildren.push(child);
      }
    }
  }

  if (isMatchSelf || hasMatchInChildren) {
    return {
      ...userNode,
      children: newChildren,
      matchInChildren: !isMatchSelf && hasMatchInChildren,
    };
  }

  return null;
};

const filterUsers = (users: ExtendedUser[], searchString: string): ExtendedUser[] => {
  if (!searchString || searchString === '') return users;
  return users
    .map((user) => filterUserNode(user, searchString))
    .filter((user) => user !== null) as ExtendedUser[];
};

const parseAddedAtMs = (addedAt: string | undefined): number => {
  const parsed = Date.parse(addedAt ?? '');
  return Number.isNaN(parsed) ? 0 : parsed;
};

const compareByNewUserRecency = (a: ExtendedUser | User, b: ExtendedUser | User): number => {
  const aIsNewUser = isNewUser(a.addedAt);
  const bIsNewUser = isNewUser(b.addedAt);

  if (aIsNewUser !== bIsNewUser) {
    return aIsNewUser ? -1 : 1;
  }

  if (!aIsNewUser) {
    return 0;
  }

  return parseAddedAtMs(b.addedAt) - parseAddedAtMs(a.addedAt);
};

const sortUsers = (users: (ExtendedUser | User)[]): (ExtendedUser | User)[] => {
  const processedUsers = users.map((user) => {
    const userCopy = { ...user };
    if (Array.isArray(userCopy.children) && userCopy.children.length > 0) {
      userCopy.children = sortUsers(userCopy.children);
    }
    return userCopy;
  });
  return processedUsers.sort((a, b) => {
    const byNewUserRecency = compareByNewUserRecency(a, b);
    if (byNewUserRecency !== 0) {
      return byNewUserRecency;
    }

    if (a.type?.toLowerCase() === 'organisasjon' && b.type?.toLowerCase() !== 'organisasjon')
      return -1;
    if (b.type?.toLowerCase() === 'organisasjon' && a.type?.toLowerCase() !== 'organisasjon')
      return 1;
    const aSortKey = a.sortKey ?? a.name;
    const bSortKey = b.sortKey ?? b.name;
    return aSortKey.localeCompare(bSortKey);
  });
};

export const useFilteredUsers = ({
  connections,
  indirectConnections,
  searchString,
}: useFilteredUsersProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [indirectUserPage, setIndirectUserPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [connections, searchString]);

  useEffect(() => {
    setIndirectUserPage(1);
  }, [indirectConnections, searchString]);

  const processedUsers = useMemo(() => {
    if (!connections || connections.length === 0) return [];

    const extendedUsers = mapToExtendedUsers(connections);
    const filtered = filterUsers(extendedUsers, searchString);
    const sorted = sortUsers(filtered);
    return sorted;
  }, [connections, searchString]);

  const paginatedUsers = useMemo(() => {
    return processedUsers.slice(0, PAGE_SIZE * currentPage);
  }, [processedUsers, currentPage]);

  const hasNextPage = processedUsers.length > PAGE_SIZE * currentPage;

  const indirectUsers = useMemo(() => {
    if (!indirectConnections) return undefined;

    const sortedUsers = sortUsers(
      filterUsers(mapToExtendedUsers(indirectConnections), searchString),
    ) as ExtendedUser[];

    // Collect ids of all direct users for pruning
    const directUserIds = (() => {
      const ids = new Set<string>();
      connections?.forEach((connection) => {
        ids.add(connection.party.id);
      });
      return ids;
    })();

    return sortedUsers.reduce<ExtendedUser[]>((acc, user) => {
      if (!directUserIds.has(user.id)) {
        acc.push(user);
      }
      return acc;
    }, []);
  }, [indirectConnections, searchString, connections]);

  const indirectPaginatedUsers = useMemo(() => {
    if (!indirectUsers) return [];
    return indirectUsers.slice(0, PAGE_SIZE * indirectUserPage);
  }, [indirectUsers, indirectUserPage]);

  const hasNextIndirectPage = indirectUsers && indirectUsers.length > PAGE_SIZE * indirectUserPage;

  const goNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const goNextIndirectPage = () => {
    if (hasNextIndirectPage) {
      setIndirectUserPage((prevPage) => prevPage + 1);
    }
  };

  return {
    users: paginatedUsers,
    indirectUsers: indirectPaginatedUsers,
    hasNextPage,
    hasNextIndirectPage,
    goNextPage,
    goNextIndirectPage,
    totalFilteredCount: processedUsers.length,
  };
};
