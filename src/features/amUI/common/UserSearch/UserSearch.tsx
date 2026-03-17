import React, { useMemo, useState } from 'react';
import { DsSearch, DsParagraph, formatDisplayName } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { PartyType, User } from '@/rtk/features/userInfoApi';
import { ConnectionUserType } from '@/rtk/features/connectionApi';
import { NewUserButton } from '@/features/amUI/users/NewUserModal/NewUserModal';

import classes from './UserSearch.module.css';
import { useFilteredUsers } from '../UserList/useFilteredUsers';
import { DelegationAction } from '../DelegationModal/EditModal';
import { UserList } from '../UserList/UserList';
import { UserSearchResults, titleAsType } from './UserSearchResults';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';
import type { UserActionTarget, UserSearchNode } from './types';

export interface UserSearchProps {
  includeSelfAsChild: boolean;
  includeSelfAsChildOnIndirect?: boolean;
  showIndirectConnectionsByDefault?: boolean;
  users?: UserSearchNode[];
  indirectUsers?: UserSearchNode[];
  getUserLink?: (user: UserActionTarget) => string;
  onDelegate?: (user: UserActionTarget) => void;
  onAddNewUser?: (user: User) => void;
  onRevoke?: (user: UserActionTarget) => void;
  isLoading?: boolean;
  isActionLoading?: boolean;
  canDelegate?: boolean;
  AddUserButton?: React.ComponentType<{ isLarge?: boolean; onComplete?: (user: User) => void }>;
  noUsersText?: string;
  searchPlaceholder?: string;
  addUserButtonLabel?: string;
  directConnectionsHeading?: string;
  indirectConnectionsHeading?: string;
  additionalFilters?: React.ReactNode;
  hasActiveAdditionalFilters?: boolean;
  titleAs?: titleAsType;
}

const filterAvailableUserTypes = (items?: UserSearchNode[]) =>
  items?.filter(
    (item) =>
      item.type === ConnectionUserType.Person || item.type === ConnectionUserType.Organization,
  ) || [];

export const UserSearch: React.FC<UserSearchProps> = ({
  includeSelfAsChild,
  includeSelfAsChildOnIndirect = true,
  showIndirectConnectionsByDefault = false,
  users: initialUsers,
  indirectUsers: initialIndirectUsers,
  getUserLink,
  onDelegate,
  onAddNewUser,
  onRevoke,
  isLoading = false,
  isActionLoading = false,
  canDelegate = true,
  AddUserButton = NewUserButton,
  noUsersText,
  searchPlaceholder,
  addUserButtonLabel,
  directConnectionsHeading,
  indirectConnectionsHeading,
  additionalFilters,
  hasActiveAdditionalFilters = false,
  titleAs = 'h4',
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const { fromParty } = usePartyRepresentation();
  const directUsers = useMemo(() => filterAvailableUserTypes(initialUsers), [initialUsers]);

  const indirectUsers = useMemo(
    () => filterAvailableUserTypes(initialIndirectUsers),
    [initialIndirectUsers],
  );

  const trimmedQuery = query.trim();
  const isQuery = trimmedQuery !== '' || hasActiveAdditionalFilters;
  const hasFiltersOnly = hasActiveAdditionalFilters && trimmedQuery === '';

  const {
    users: filteredDirectUsers,
    hasNextPage,
    goNextPage,
    indirectUsers: filteredIndirectUsers,
    hasNextIndirectPage,
    goNextIndirectPage,
  } = useFilteredUsers({
    users: directUsers,
    indirectUsers,
    searchString: trimmedQuery,
  });

  const hasDirectUsers = (directUsers?.length ?? 0) > 0;
  const directHasResults = (filteredDirectUsers?.length ?? 0) > 0;
  const indirectHasResults = (filteredIndirectUsers?.length ?? 0) > 0;
  const shouldShowIndirectSection = isQuery || showIndirectConnectionsByDefault;

  const showDirectNoResults = isQuery && !directHasResults && indirectHasResults;
  const showIndirectList = shouldShowIndirectSection && indirectHasResults && canDelegate;
  const showEmptyState = isQuery && !directHasResults && !indirectHasResults;

  const handleAddNewUser = async (user: User) => {
    if (onAddNewUser) {
      if (user?.id && user?.name) {
        onAddNewUser(user);
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
        <div className={classes.searchAndFilters}>
          <DsSearch className={classes.searchBar}>
            <DsSearch.Input
              aria-label={t('common.search')}
              placeholder={searchPlaceholder ?? t('advanced_user_search.user_search_placeholder')}
              value={query}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setQuery(event.target.value)
              }
            />
            {query && <DsSearch.Clear onClick={() => setQuery('')} />}
          </DsSearch>
          {additionalFilters}
        </div>
        {canDelegate && AddUserButton && (
          <div className={classes.buttonRow}>
            <AddUserButton onComplete={handleAddNewUser} />
          </div>
        )}
      </div>

      <div className={classes.results}>
        <>
          {!hasDirectUsers && !isLoading && !isQuery && !showIndirectList && (
            <DsParagraph
              data-size='md'
              className={classes.tabDescription}
            >
              {noUsersText ??
                t('package_poa_details_page.users_tab.no_users', {
                  fromparty: formatDisplayName({
                    fullName: fromParty?.name ?? '',
                    type: fromParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
                  }),
                })}
            </DsParagraph>
          )}
          {showIndirectList && (
            <h3 className={classes.subHeader}>
              {directConnectionsHeading ?? t('advanced_user_search.direct_connections')}
            </h3>
          )}
          <UserSearchResults
            users={filteredDirectUsers}
            hasNextPage={hasNextPage}
            goNextPage={goNextPage}
            availableAction={DelegationAction.REVOKE}
            isActionLoading={isActionLoading}
            onRevoke={onRevoke}
            includeSelfAsChild={includeSelfAsChild}
            getUserLink={getUserLink}
            titleAs={titleAs}
          />
          {showDirectNoResults && (
            <DsParagraph data-size='md'>
              {t(
                hasFiltersOnly
                  ? 'advanced_user_search.user_no_filter_result'
                  : 'advanced_user_search.user_no_search_result',
                { searchTerm: trimmedQuery },
              )}
            </DsParagraph>
          )}
        </>

        {showIndirectList && (
          <>
            <h3 className={classes.subHeader}>
              {indirectConnectionsHeading ?? t('advanced_user_search.indirect_connections')}
            </h3>
            <UserSearchResults
              users={filteredIndirectUsers}
              hasNextPage={!!hasNextIndirectPage}
              goNextPage={goNextIndirectPage}
              availableAction={DelegationAction.DELEGATE}
              onDelegate={canDelegate ? onDelegate : undefined}
              isActionLoading={isActionLoading}
              includeSelfAsChild={includeSelfAsChildOnIndirect}
              delegateLabel={addUserButtonLabel}
            />
          </>
        )}

        {showEmptyState && (
          <div className={classes.emptyState}>
            <DsParagraph data-size='md'>
              {t(
                canDelegate
                  ? hasFiltersOnly
                    ? 'advanced_user_search.user_no_filter_result_with_add_suggestion'
                    : 'advanced_user_search.user_no_search_result_with_add_suggestion'
                  : hasFiltersOnly
                    ? 'advanced_user_search.user_no_filter_result'
                    : 'advanced_user_search.user_no_search_result',
                { searchTerm: trimmedQuery || '' },
              )}
            </DsParagraph>
            {canDelegate && AddUserButton && (
              <AddUserButton
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

export default UserSearch;
