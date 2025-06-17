import { useMemo, useState, useEffect } from 'react';

import type { Connection, RoleInfo, User } from '@/rtk/features/userInfoApi';

const PAGE_SIZE = 10;

interface useFilteredUsersProps {
  connections?: Connection[];
  searchString: string;
}

export interface ExtendedUser extends Omit<User, 'children'> {
  roles: RoleInfo[];
  children: (ExtendedUser | User)[];
  matchInChildren?: boolean;
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

const filterUserNode = (
  userNode: ExtendedUser,
  lowerCaseSearchString: string,
): ExtendedUser | null => {
  const isMatchSelf = partyMatchesSearchTerm(userNode, lowerCaseSearchString);

  if (isMatchSelf) {
    return { ...userNode, matchInChildren: false };
  }

  const filteredChildren =
    userNode.children?.filter((child) => partyMatchesSearchTerm(child, lowerCaseSearchString)) ??
    [];

  if (filteredChildren.length > 0) {
    return {
      ...userNode,
      children: filteredChildren,
      matchInChildren: true,
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

export const useFilteredUsers = ({ connections, searchString }: useFilteredUsersProps) => {
  const [currentPage, setCurrentPage] = useState(1);

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

  const goNextPage = () => {
    if (hasNextPage) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  return {
    users: paginatedUsers,
    hasNextPage,
    goNextPage,
    totalFilteredCount: processedUsers.length,
  };
};
