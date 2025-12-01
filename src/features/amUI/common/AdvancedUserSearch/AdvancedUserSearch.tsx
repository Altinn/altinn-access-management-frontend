import React, { useMemo, useState } from 'react';
import { DsSearch, DsParagraph, DsButton } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { ExtendedUser, User } from '@/rtk/features/userInfoApi';
import { ConnectionUserType, type Connection } from '@/rtk/features/connectionApi';
import { NewUserButton } from '@/features/amUI/users/NewUserModal/NewUserModal';

import classes from './AdvancedUserSearch.module.css';
import { useFilteredUsers } from '../UserList/useFilteredUsers';
import { DelegationAction } from '../DelegationModal/EditModal';
import { UserList } from '../UserList/UserList';
import { ConnectionsList } from './ConnectionsList';

export interface AdvancedUserSearchProps {
  connections?: ExtendedUser[];
  indirectConnections?: ExtendedUser[];
  onDelegate?: (user: User) => void;
  onRevoke?: (user: User) => void;
  isLoading?: boolean;
  isActionLoading?: boolean;
  canDelegate?: boolean;
}

const filterAvailableUserTypes = (items?: ExtendedUser[]) =>
  items?.filter(
    (item) =>
      item.type === ConnectionUserType.Person || item.type === ConnectionUserType.Organization,
  ) || [];

export const AdvancedUserSearch: React.FC<AdvancedUserSearchProps> = ({
  connections,
  indirectConnections,
  onDelegate,
  onRevoke,
  isLoading = false,
  isActionLoading = false,
  canDelegate = true,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const filteredConnections = useMemo(() => filterAvailableUserTypes(connections), [connections]);

  const filteredIndirectConnections = useMemo(
    () => filterAvailableUserTypes(indirectConnections),
    [indirectConnections],
  );

  const trimmedQuery = query.trim();
  const isQuery = trimmedQuery !== '';

  const { users, hasNextPage, goNextPage, indirectUsers, hasNextIndirectPage, goNextIndirectPage } =
    useFilteredUsers({
      connections: filteredConnections,
      indirectConnections: filteredIndirectConnections,
      searchString: trimmedQuery,
    });

  const directHasResults = (users?.length ?? 0) > 0;
  const indirectHasResults = (indirectUsers?.length ?? 0) > 0;

  const showDirectNoResults = isQuery && !directHasResults && indirectHasResults;
  const showIndirectList = isQuery && indirectHasResults && canDelegate;
  const showEmptyState = !directHasResults && !indirectHasResults;

  const handleAddNewUser = async (user: User) => {
    if (onDelegate) {
      if (user?.id && user?.name) {
        onDelegate(user);
      }
    }
  };

  if (isLoading) {
    return (
      <UserList
        isLoading={true}
        searchString={query}
      />
    );
  }
  return (
    <div className={classes.container}>
      <div className={classes.controls}>
        <DsSearch className={classes.searchBar}>
          <DsSearch.Input
            aria-label={t('common.search')}
            placeholder={t('advanced_user_search.user_search_placeholder')}
            value={query}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
          />
          {query && <DsSearch.Clear onClick={() => setQuery('')} />}
        </DsSearch>
        {canDelegate && (
          <div className={classes.buttonRow}>
            <NewUserButton onComplete={handleAddNewUser} />
          </div>
        )}
      </div>

      <div className={classes.results}>
        <>
          {showDirectNoResults && (
            <h3 className={classes.subHeader}>{t('advanced_user_search.direct_connections')}</h3>
          )}
          <ConnectionsList
            users={users as ExtendedUser[]}
            hasNextPage={hasNextPage}
            goNextPage={goNextPage}
            availableAction={DelegationAction.REVOKE}
            isActionLoading={isActionLoading}
            onRevoke={onRevoke}
          />
          {showDirectNoResults && (
            <DsParagraph data-size='md'>
              {t('advanced_user_search.user_no_search_result', { searchTerm: trimmedQuery })}
            </DsParagraph>
          )}
        </>

        {showIndirectList && (
          <>
            <h3 className={classes.subHeader}>{t('advanced_user_search.indirect_connections')}</h3>
            <ConnectionsList
              users={indirectUsers as ExtendedUser[]}
              hasNextPage={!!hasNextIndirectPage}
              goNextPage={goNextIndirectPage}
              availableAction={DelegationAction.DELEGATE}
              onDelegate={canDelegate ? onDelegate : undefined}
              isActionLoading={isActionLoading}
            />
          </>
        )}

        {showEmptyState && (
          <div className={classes.emptyState}>
            <DsParagraph data-size='md'>
              {t(
                canDelegate
                  ? 'advanced_user_search.user_no_search_result_with_add_suggestion'
                  : 'advanced_user_search.user_no_search_result',
                { searchTerm: trimmedQuery },
              )}
            </DsParagraph>
            {canDelegate && (
              <NewUserButton
                isLarge
                onComplete={handleAddNewUser}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedUserSearch;
