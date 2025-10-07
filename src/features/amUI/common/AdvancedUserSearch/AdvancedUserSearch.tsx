import React, { useMemo, useState } from 'react';
import { DsSearch, DsParagraph, DsButton } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { PlusIcon } from '@navikt/aksel-icons';

import {
  ConnectionUserType,
  ExtendedUser,
  User,
  type Connection,
} from '@/rtk/features/userInfoApi';
import { NewUserButton } from '@/features/amUI/users/NewUserModal/NewUserModal';

import classes from './AdvancedUserSearch.module.css';
import { useFilteredUsers } from '../UserList/useFilteredUsers';
import { DelegationAction } from '../DelegationModal/EditModal';
import { UserList } from '../UserList/UserList';
import { ConnectionsList } from './ConnectionsList';

export interface AdvancedUserSearchProps {
  connections?: Connection[];
  indirectConnections?: Connection[];
  onDelegate?: (user: User) => void;
  onRevoke?: (user: User) => void;
  isLoading?: boolean;
  isActionLoading?: boolean;
}

const filterSystemUsers = (items?: Connection[]) =>
  items?.filter((item) => item.party.type !== ConnectionUserType.Systemuser);

export const AdvancedUserSearch: React.FC<AdvancedUserSearchProps> = ({
  connections,
  indirectConnections,
  onDelegate,
  onRevoke,
  isLoading = false,
  isActionLoading = false,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const filteredConnections = useMemo(() => filterSystemUsers(connections), [connections]);

  const filteredIndirectConnections = useMemo(
    () => filterSystemUsers(indirectConnections),
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
  const showIndirectList = isQuery && indirectHasResults;
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
        <div className={classes.buttonRow}>
          <NewUserButton onComplete={handleAddNewUser} />
        </div>
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
              onDelegate={onDelegate}
              isActionLoading={isActionLoading}
            />
          </>
        )}

        {showEmptyState && (
          <div className={classes.emptyState}>
            <DsParagraph data-size='md'>
              {t('advanced_user_search.user_no_search_result_with_add_suggestion', {
                searchTerm: trimmedQuery,
              })}
            </DsParagraph>
            <NewUserButton
              isLarge
              onComplete={handleAddNewUser}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedUserSearch;
