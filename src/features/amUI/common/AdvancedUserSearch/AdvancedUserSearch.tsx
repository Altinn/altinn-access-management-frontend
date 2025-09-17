import React, { useMemo, useState } from 'react';
import { DsSearch, DsParagraph, DsButton } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { ConnectionUserType, type Connection } from '@/rtk/features/userInfoApi';
import { NewUserButton } from '@/features/amUI/users/NewUserModal/NewUserModal';

import classes from './AdvancedUserSearch.module.css';
import { useFilteredUsers } from '../UserList/useFilteredUsers';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import { DelegationAction } from '../DelegationModal/EditModal';
import { ExtendedAccessPackage } from '../AccessPackageList/useAreaPackageList';
import { UserList } from '../UserList/UserList';
import { PlusCircleIcon } from '@navikt/aksel-icons';
import { ConnectionsList } from './ConnectionsList';

export interface AdvancedUserSearchProps {
  connections?: Connection[];
  indirectConnections?: Connection[];
  accessPackage?: ExtendedAccessPackage;
  onDelegate?: (userId: string) => void;
  onRevoke?: (userId: string) => void;
  availableActions?: DelegationAction[];
  isLoading?: boolean;
  canDelegate?: boolean;
}

export const AdvancedUserSearch: React.FC<AdvancedUserSearchProps> = ({
  connections,
  indirectConnections,
  accessPackage,
  onDelegate,
  onRevoke,
  isLoading = false,
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

  const { users, hasNextPage, goNextPage, indirectUsers, hasNextIndirectPage, goNextIndirectPage } =
    useFilteredUsers({
      connections: filteredConnections,
      indirectConnections: filteredIndirectConnections,
      searchString: query,
    });

  const trimmedQuery = query.trim();
  const isQuery = trimmedQuery !== '';

  const directHasResults = (users?.length ?? 0) > 0;
  const indirectHasResults = (indirectUsers?.length ?? 0) > 0;

  const showDirectSection = !addUsersMode;
  const showDirectList = showDirectSection && directHasResults;
  // Only show a direct "no results" message when searching and there ARE indirect results,
  // otherwise the overall empty state will cover both lists.
  const showDirectNoResults =
    showDirectSection && !directHasResults && isQuery && indirectHasResults;

  // Only show indirect connections if in addUsersMode or if search query is not empty
  const showIndirectSection = addUsersMode || isQuery;
  const showIndirectList = showIndirectSection && indirectHasResults;

  // Show empty state if: (1) searching and no results in either list, or
  // (2) in addUsersMode and no results in indirectUsers
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

        {addUsersMode ? (
          <>
            <DsButton
              variant='secondary'
              onClick={() => setAddUsersMode(false)}
            >
              {t('common.cancel')}
            </DsButton>
            {/* <NewUserButton /> */}
          </>
        ) : (
          <DsButton
            variant='secondary'
            onClick={() => setAddUsersMode(true)}
          >
            <PlusCircleIcon /> {t('advanced_user_search.add_user_button')}
          </DsButton>
        )}
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
