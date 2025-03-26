import { useCallback, useMemo, useState } from 'react';
import { Heading, Search } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import type { User } from '@/rtk/features/userInfoApi';
import { useGetRightHoldersQuery, useGetUserInfoQuery } from '@/rtk/features/userInfoApi';
import { debounce } from '@/resources/utils';

import { UserList } from '../common/UserList/UserList';
import { CurrentUserPageHeader } from '../common/CurrentUserPageHeader/CurrentUserPageHeader';

import classes from './UsersList.module.css';
import { NewUserButton } from './NewUserModal/NewUserModal';

const extractFromList = (
  list: User[],
  uuidToRemove: string,
  onRemove: (removed: User) => void,
): User[] => {
  const remainingList = list.reduce<User[]>((acc, item) => {
    if (item.partyUuid === uuidToRemove) {
      onRemove(item);
    } else {
      acc.push(item);
    }
    return acc;
  }, []);
  return remainingList;
};

export const UsersList = () => {
  const { t } = useTranslation();

  const { data: rightHolders, isLoading } = useGetRightHoldersQuery();
  const { data: currentUser, isLoading: currentUserLoading } = useGetUserInfoQuery();

  const [currentUserAsRightHolder, setCurrentUserAsRightHolder] = useState<User>();
  const [searchString, setSearchString] = useState<string>('');

  const userList = useMemo(() => {
    const remainingAfterExtraction = extractFromList(
      rightHolders || [],
      currentUser?.uuid ?? 'loading',
      setCurrentUserAsRightHolder,
    );
    return remainingAfterExtraction;
  }, [rightHolders, currentUser]);

  const onSearch = useCallback(
    debounce((newSearchString: string) => {
      setSearchString(newSearchString);
    }, 300),
    [],
  );

  return (
    <div className={classes.usersList}>
      <CurrentUserPageHeader
        currentUser={currentUserAsRightHolder}
        loading={currentUserLoading}
        as={(props) =>
          currentUserAsRightHolder ? (
            <Link
              {...props}
              to={`${currentUserAsRightHolder?.partyUuid}`}
            />
          ) : (
            <div {...props} />
          )
        }
      />
      <Heading
        level={2}
        data-size='sm'
        id='user_list_heading_id'
        className={classes.usersListHeading}
      >
        {t('users_page.user_list_heading')}
      </Heading>
      <div className={classes.searchAndAddUser}>
        <Search className={classes.searchBar}>
          <Search.Input
            aria-label={t('users_page.user_search_placeholder')}
            placeholder={t('users_page.user_search_placeholder')}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => onSearch(event.target.value)}
          />
          <Search.Clear
            onClick={() => {
              setSearchString('');
            }}
          />
        </Search>
        <NewUserButton />
      </div>
      <UserList
        userList={userList || []}
        searchString={searchString}
        isLoading={isLoading}
        listItemTitleAs='h3'
      />
    </div>
  );
};
