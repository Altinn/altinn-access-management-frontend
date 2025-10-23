import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { DsHeading, DsSearch } from '@altinn/altinn-components';

import type { User } from '@/rtk/features/userInfoApi';
import { useGetIsAdminQuery, useGetUserInfoQuery } from '@/rtk/features/userInfoApi';
import {
  type Connection,
  ConnectionUserType,
  useGetRightHoldersQuery,
} from '@/rtk/features/connectionApi';
import { debounce } from '@/resources/utils';

import { UserList } from '../common/UserList/UserList';
import { CurrentUserPageHeader } from '../common/CurrentUserPageHeader/CurrentUserPageHeader';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';

import classes from './UsersList.module.css';
import { NewUserButton } from './NewUserModal/NewUserModal';
import useSelfConnection from '../common/PartyRepresentationContext/useSelfConnection';

const extractFromList = (
  list: Connection[],
  uuidToRemove: string,
  onRemove?: (removed: Connection) => void,
): Connection[] => {
  const remainingList = list.reduce<Connection[]>((acc, item) => {
    if (item.party.id === uuidToRemove) {
      onRemove?.(item);
    } else if (item.party.type !== ConnectionUserType.Systemuser) {
      acc.push(item);
    }
    return acc;
  }, []);
  return remainingList;
};

export const UsersList = () => {
  const { t } = useTranslation();
  const { fromParty, isLoading: loadingPartyRepresentation } = usePartyRepresentation();
  const displayLimitedPreviewLaunch = window.featureFlags?.displayLimitedPreviewLaunch;
  const navigate = useNavigate();
  const { data: isAdmin } = useGetIsAdminQuery();

  const { data: rightHolders, isLoading: loadingRightHolders } = useGetRightHoldersQuery(
    {
      partyUuid: fromParty?.partyUuid ?? '',
      fromUuid: fromParty?.partyUuid ?? '',
      toUuid: '', // all
    },
    {
      skip: !fromParty?.partyUuid || !isAdmin,
    },
  );
  const { partyConnection: currentUser, isLoading: currentUserLoading } = useSelfConnection();

  const handleNewUser = (user: User) => {
    navigate(`/users/${user.id}`);
  };

  const [searchString, setSearchString] = useState<string>('');

  const userList = useMemo(() => {
    if (!rightHolders) {
      return null;
    }
    const remainingAfterExtraction = extractFromList(
      rightHolders || [],
      displayLimitedPreviewLaunch ? 'nobody' : (currentUser?.party.id ?? 'loading'),
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
      {!displayLimitedPreviewLaunch && (
        <>
          <CurrentUserPageHeader
            currentUser={currentUser}
            loading={!!(currentUserLoading || loadingPartyRepresentation)}
            as={(props) =>
              currentUser ? (
                <Link
                  {...props}
                  to={`/users/${currentUser?.party.id ?? ''}`}
                />
              ) : (
                <div {...props} />
              )
            }
          />
          <DsHeading
            level={2}
            data-size='sm'
            id='user_list_heading_id'
            className={classes.usersListHeading}
          >
            {t('users_page.user_list_heading')}
          </DsHeading>
        </>
      )}
      <div className={classes.searchAndAddUser}>
        <DsSearch className={classes.searchBar}>
          <DsSearch.Input
            aria-label={t('users_page.user_search_placeholder')}
            placeholder={t('users_page.user_search_placeholder')}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => onSearch(event.target.value)}
          />
          <DsSearch.Clear
            onClick={() => {
              setSearchString('');
            }}
          />
        </DsSearch>
        {isAdmin && <NewUserButton onComplete={handleNewUser} />}
      </div>
      {isAdmin && (
        <UserList
          connections={userList ?? undefined}
          searchString={searchString}
          isLoading={!userList || loadingRightHolders || loadingPartyRepresentation}
          listItemTitleAs='h2'
          interactive={isAdmin}
          onAddNewUser={handleNewUser}
        />
      )}
    </div>
  );
};
