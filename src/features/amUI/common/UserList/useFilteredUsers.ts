import { useMemo, useState, useEffect } from 'react';

import type { UserSearchNode } from '../UserSearch/types';

const PAGE_SIZE = 10;

interface useFilteredUsersProps {
  users?: UserSearchNode[];
  indirectUsers?: UserSearchNode[];
  searchString: string;
}

const partyMatchesSearchTerm = (party: UserSearchNode, searchString: string): boolean => {
  const lowerCaseSearchTerm = searchString.toLocaleLowerCase();
  const nameMatch = party.name.toLowerCase().includes(lowerCaseSearchTerm);
  const orgNumberMatch = party.organizationIdentifier
    ? party.organizationIdentifier.toString().toLowerCase().includes(lowerCaseSearchTerm)
    : false;
  return nameMatch || orgNumberMatch;
};

const filterUserNode = (userNode: UserSearchNode, searchString: string): UserSearchNode | null => {
  const isMatchSelf = partyMatchesSearchTerm(userNode, searchString);

  if (isMatchSelf) {
    return {
      ...userNode,
      matchInChildren: false,
    };
  }

  const matchingChildren =
    userNode.children
      ?.map((child) => filterUserNode(child, searchString))
      .filter((child) => child !== null) ?? [];

  if (matchingChildren.length > 0) {
    return {
      ...userNode,
      children: matchingChildren,
      matchInChildren: true,
    };
  }

  return null;
};

const filterUsers = (users: UserSearchNode[], searchString: string): UserSearchNode[] => {
  if (!searchString || searchString === '') return users;
  return users
    .map((user) => filterUserNode(user, searchString))
    .filter((user) => user !== null) as UserSearchNode[];
};

const sortUsers = (users: UserSearchNode[]): UserSearchNode[] => {
  const processedUsers = users.map((user) => {
    const userCopy = { ...user };
    if (Array.isArray(userCopy.children) && userCopy.children.length > 0) {
      userCopy.children = sortUsers(userCopy.children);
    }
    return userCopy;
  });
  return processedUsers.sort((a, b) => {
    const aSortKey = a.sortKey ?? a.name;
    const bSortKey = b.sortKey ?? b.name;
    const sortKeyComparison = aSortKey.localeCompare(bSortKey);
    if (sortKeyComparison !== 0) {
      return sortKeyComparison;
    }

    if (a.type?.toLowerCase() === 'organisasjon' && b.type?.toLowerCase() !== 'organisasjon')
      return -1;
    if (b.type?.toLowerCase() === 'organisasjon' && a.type?.toLowerCase() !== 'organisasjon')
      return 1;

    return a.name.localeCompare(b.name);
  });
};

export const useFilteredUsers = ({
  users,
  indirectUsers: initialIndirectUsers,
  searchString,
}: useFilteredUsersProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [indirectUserPage, setIndirectUserPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [users, searchString]);

  useEffect(() => {
    setIndirectUserPage(1);
  }, [initialIndirectUsers, searchString]);

  const processedUsers = useMemo(() => {
    if (!users || users.length === 0) return [];

    const filtered = filterUsers(users, searchString);
    const sorted = sortUsers(filtered);
    return sorted;
  }, [users, searchString]);

  const paginatedUsers = useMemo(() => {
    return processedUsers.slice(0, PAGE_SIZE * currentPage);
  }, [processedUsers, currentPage]);

  const hasNextPage = processedUsers.length > PAGE_SIZE * currentPage;

  const indirectUsers = useMemo(() => {
    if (!initialIndirectUsers) return undefined;

    const sortedUsers = sortUsers(filterUsers(initialIndirectUsers, searchString));

    // Collect ids of all direct users for pruning
    const directUserIds = (() => {
      const ids = new Set<string>();
      users?.forEach((user) => {
        ids.add(user.id);
      });
      return ids;
    })();

    return sortedUsers.reduce<UserSearchNode[]>((acc, user) => {
      if (!directUserIds.has(user.id)) {
        acc.push(user);
      }
      return acc;
    }, []);
  }, [initialIndirectUsers, searchString, users]);

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
