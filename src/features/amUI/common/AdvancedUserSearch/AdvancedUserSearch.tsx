import React, { useMemo, useState } from 'react';
import { DsSearch, DsParagraph, DsButton } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { ConnectionUserType, User, type Connection } from '@/rtk/features/userInfoApi';
import { NewUserButton } from '@/features/amUI/users/NewUserModal/NewUserModal';

import classes from './AdvancedUserSearch.module.css';
import { useFilteredUsers } from '../UserList/useFilteredUsers';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import { DelegationAction } from '../DelegationModal/EditModal';
import { UserList } from '../UserList/UserList';
import { ConnectionsList } from './ConnectionsList';

export interface AdvancedUserSearchProps {
  connections?: Connection[];
  indirectConnections?: Connection[];
  onDelegate?: (user: User) => void;
  onRevoke?: (user: User) => void;
  availableActions?: DelegationAction[];
  isLoading?: boolean;
  isActionLoading?: boolean;
  canDelegate?: boolean;
}

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
  const isSm = useIsMobileOrSmaller();
  const [addUsersMode, setAddUsersMode] = useState(false);

  const filteredConnections = useMemo(
    () => connections?.filter((item) => item.party.type !== ConnectionUserType.Systemuser),
    [connections],
  );

  const filteredIndirectConnections = useMemo(
    () => indirectConnections?.filter((item) => item.party.type !== ConnectionUserType.Systemuser),
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

  const showDirectSection = !addUsersMode;
  const showDirectList = showDirectSection && directHasResults;

  const showDirectNoResults =
    showDirectSection && !directHasResults && isQuery && indirectHasResults;

  const showIndirectSection = addUsersMode || isQuery;
  const showIndirectList = showIndirectSection && indirectHasResults;

  const showEmptyState =
    (isQuery && !directHasResults && !indirectHasResults) || (addUsersMode && !indirectHasResults);

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
      </div>

      <div className={classes.results}>
        {showDirectSection && (
          <>
            {(showDirectList || showDirectNoResults) && (
              <h3 className={classes.subHeader}>{t('advanced_user_search.direct_connections')}</h3>
            )}
            {showDirectList && (
              <ConnectionsList
                users={users}
                isSm={isSm}
                hasNextPage={hasNextPage}
                goNextPage={goNextPage}
                availableAction={DelegationAction.REVOKE}
                isActionLoading={isActionLoading}
                onRevoke={onRevoke}
              />
            )}
            {showDirectNoResults && (
              <DsParagraph data-size='md'>
                {t('advanced_user_search.user_no_search_result', { searchTerm: trimmedQuery })}
              </DsParagraph>
            )}
          </>
        )}

        {showIndirectList && (
          <>
            <h3 className={classes.subHeader}>{t('advanced_user_search.indirect_connections')}</h3>
            <ConnectionsList
              users={indirectUsers}
              isSm={isSm}
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
            <NewUserButton isLarge />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedUserSearch;
