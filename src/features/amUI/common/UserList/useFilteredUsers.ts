import { useMemo, useState, useEffect } from 'react';

import type { Connection, ExtendedUser, User } from '@/rtk/features/userInfoApi';

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

    return {
      ...connection.party,
      roles: connection.roles,
      children,
    };
  });
};

const partyMatchesSearchTerm = (party: User | ExtendedUser, searchString: string): boolean => {
  const lowerCaseSearchTerm = searchString.toLocaleLowerCase();
  const nameMatch = party.name.toLowerCase().includes(lowerCaseSearchTerm);
  const orgNumberMatch = party.keyValues?.OrganizationIdentifier
    ? party.keyValues.OrganizationIdentifier?.includes(lowerCaseSearchTerm)
    : false;
  return nameMatch || orgNumberMatch;
};

const isExtendedUser = (user: ExtendedUser | User): user is ExtendedUser => {
  return (
    // roles is only present on ExtendedUser, children may exist on ExtendedUser
    (user as ExtendedUser).roles !== undefined || Array.isArray((user as ExtendedUser).children)
  );
};

const filterUserNode = (userNode: ExtendedUser, searchString: string): ExtendedUser | null => {
  const isMatchSelf = partyMatchesSearchTerm(userNode, searchString);

  // Recursively evaluate and prune children to only keep matching branches or matching leaf users
  const filteredChildren = (userNode.children ?? []).reduce<(ExtendedUser | User)[]>(
    (acc, child) => {
      if (isExtendedUser(child)) {
        const filteredChild = filterUserNode(child, searchString);
        if (filteredChild) acc.push(filteredChild);
      } else if (partyMatchesSearchTerm(child, searchString)) {
        acc.push(child);
      }
      return acc;
    },
    [],
  );

  if (isMatchSelf || filteredChildren.length > 0) {
    return {
      ...userNode,
      children: filteredChildren,
      matchInChildren: !isMatchSelf && filteredChildren.length > 0,
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

const sortUsers = (users: (ExtendedUser | User)[]): (ExtendedUser | User)[] => {
  const processedUsers = users.map((user) => {
    const userCopy = { ...user };
    if (Array.isArray(userCopy.children) && userCopy.children.length > 0) {
      userCopy.children = sortUsers(userCopy.children);
    }
    return userCopy;
  });
  return processedUsers.sort((a, b) => a.name.localeCompare(b.name));
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
    const mappedUsers = mapToExtendedUsers(indirectConnections);
    const filtered = filterUsers(mappedUsers, searchString);
    const sortedUsers = sortUsers(filtered);
    return sortedUsers;
  }, [indirectConnections, searchString]);

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
