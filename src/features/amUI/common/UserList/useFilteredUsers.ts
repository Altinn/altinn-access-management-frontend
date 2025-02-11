import { useMemo, useState } from 'react';

import type { User } from '@/rtk/features/userInfoApi';

const isSearchMatch = (searchString: string, rightHolder: User): boolean => {
  const isNameMatch = rightHolder.name.toLowerCase().indexOf(searchString.toLowerCase()) > -1;
  const isOrgNrMatch = rightHolder.organizationNumber === searchString;
  return isNameMatch || isOrgNrMatch;
};

export interface ExtendedUser extends User {
  matchInInheritingUsers?: boolean;
}

interface useFilteredUsersProps {
  users?: User[];
  searchString: string;
}

const PAGE_SIZE = 10;

const sortUsers = (users: User[]): User[] => {
  return [...users].sort((a, b) => a.name.localeCompare(b.name));
};

const sortInheritingUsers = (user: User): User => {
  if (user.inheritingUsers) {
    return {
      ...user,
      inheritingUsers: sortUsers(user.inheritingUsers),
    };
  }
  return user;
};

const sortUserList = (list: User[]): User[] => {
  const sortedList = sortUsers(list);
  return sortedList.map(sortInheritingUsers);
};

export const useFilteredUsers = ({ users, searchString }: useFilteredUsersProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  if (!users) {
    return {
      users: [] as ExtendedUser[],
      hasNextPage: false,
    };
  }

  const filtered = useMemo(() => {
    setCurrentPage(1);
    const sorted = sortUserList(users);
    return sorted.reduce((acc, user) => {
      if (isSearchMatch(searchString, user)) {
        acc.push(user);
      } else if (user.inheritingUsers?.length > 0) {
        const matchingInheritingItems = user.inheritingUsers.filter((inheritUser) =>
          isSearchMatch(searchString, inheritUser),
        );
        if (matchingInheritingItems.length > 0) {
          acc.push({
            ...user,
            matchInInheritingUsers: true,
            inheritingUsers: matchingInheritingItems,
          });
        }
      }
      return acc;
    }, [] as ExtendedUser[]);
  }, [users, searchString]);

  return {
    users: filtered.slice(0, PAGE_SIZE * currentPage),
    hasNextPage: filtered.length > PAGE_SIZE * currentPage,
    goNextPage: () => setCurrentPage(currentPage + 1),
  };
};
