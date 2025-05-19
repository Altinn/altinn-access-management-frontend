import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { DsHeading, DsSearch } from '@altinn/altinn-components';

import { UserList } from '../common/UserList/UserList';
import { CurrentUserPageHeader } from '../common/CurrentUserPageHeader/CurrentUserPageHeader';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';

import classes from './UsersList.module.css';
import { NewUserButton } from './NewUserModal/NewUserModal';

import type { User } from '@/rtk/features/userInfoApi';
import { useGetRightHoldersQuery, useGetUserInfoQuery } from '@/rtk/features/userInfoApi';
import { debounce } from '@/resources/utils';

const extractFromList = (
  list: User[],
  uuidToRemove: string,
  onRemove?: (removed: User) => void,
): User[] => {
  const remainingList = list.reduce<User[]>((acc, item) => {
    if (item.partyUuid === uuidToRemove) {
      onRemove?.(item);
    } else {
      acc.push(item);
    }
    return acc;
  }, []);
  return remainingList;
};

export const UsersList = () => {
  const { t } = useTranslation();
  const { fromParty } = usePartyRepresentation();
  const displayLimitedPreviewLaunch = window.featureFlags?.displayLimitedPreviewLaunch;

  const { data: rightHolders, isLoading: loadingRightHolders } = useGetRightHoldersQuery(
    {
      partyUuid: fromParty?.partyUuid ?? '',
      fromUuid: fromParty?.partyUuid ?? '',
      toUuid: '', // all
    },
    {
      skip: !fromParty?.partyUuid,
    },
  );

  const { data: currentUser, isLoading: currentUserLoading } = useGetUserInfoQuery();
  const { data: currentUserAsRightHolder, isLoading: currentUserConnectionLoading } =
    useGetRightHoldersQuery(
      {
        partyUuid: fromParty?.partyUuid ?? '',
        fromUuid: fromParty?.partyUuid ?? '',
        toUuid: currentUser?.uuid ?? '',
      },
      {
        skip: !fromParty?.partyUuid || !currentUser?.uuid,
      },
    );

  const [searchString, setSearchString] = useState<string>('');

  const userList = useMemo(() => {
    if (!rightHolders) {
      return null;
    }
    const remainingAfterExtraction = extractFromList(
      rightHolders || [],
      currentUser?.uuid ?? 'loading',
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
      {!displayLimitedPreviewLaunch && currentUserAsRightHolder && (
        <>
          <CurrentUserPageHeader
            currentUser={currentUserAsRightHolder[0]}
            loading={currentUserLoading || currentUserConnectionLoading}
            as={(props) =>
              currentUserAsRightHolder ? (
                <Link
                  {...props}
                  to={`${currentUserAsRightHolder[0]?.partyUuid}`}
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
        <NewUserButton />
      </div>
      <UserList
        userList={userList ?? undefined}
        searchString={searchString}
        isLoading={!userList || loadingRightHolders}
        listItemTitleAs='h2'
      />
    </div>
  );
};
