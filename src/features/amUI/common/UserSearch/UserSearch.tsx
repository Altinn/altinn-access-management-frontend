import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import type { RestoreFocus } from '../RestoreFocus';
import { RestoreFocusFallback, RestoreFocusProvider, useRestoreFocus } from '../RestoreFocus';
import { userRowFocusId } from '../UserList/userFocusIds';

type UserSearchAction = (user: UserActionTarget) => void;

export interface UserSearchProps {
  includeSelfAsChild: boolean;
  includeSelfAsChildOnIndirect?: boolean;
  users?: UserSearchNode[];
  indirectUsers?: UserSearchNode[];
  getUserLink?: (user: UserActionTarget) => string;
  onDelegate?: UserSearchAction;
  onAddNewUser?: (user: User) => void;
  onRevoke?: UserSearchAction;
  onSelect?: (user: UserActionTarget) => void;
  isLoading?: boolean;
  isActionLoading?: boolean;
  canDelegate?: boolean;
  AddUserButton?: React.ComponentType<{ isLarge?: boolean; onComplete?: (user: User) => void }>;
  noUsersText?: string;
  searchPlaceholder?: string;
  addUserButtonLabel?: string;
  revokeLabel?: string;
  directConnectionsHeading?: string;
  indirectConnectionsHeading?: string;
  additionalFilters?: React.ReactNode;
  hasActiveAdditionalFilters?: boolean;
  titleAs?: titleAsType;
  restoreFocus?: RestoreFocus;
}

const filterAvailableUserTypes = (items?: UserSearchNode[]) =>
  items?.filter(
    (item) =>
      item.type === ConnectionUserType.Person || item.type === ConnectionUserType.Organization,
  ) || [];

export const UserSearch: React.FC<UserSearchProps> = ({
  includeSelfAsChild,
  includeSelfAsChildOnIndirect = true,
  users: initialUsers,
  indirectUsers: initialIndirectUsers,
  getUserLink,
  onDelegate,
  onAddNewUser,
  onRevoke,
  onSelect,
  isLoading = false,
  isActionLoading = false,
  canDelegate = true,
  AddUserButton = NewUserButton,
  noUsersText,
  searchPlaceholder,
  addUserButtonLabel,
  revokeLabel,
  directConnectionsHeading,
  indirectConnectionsHeading,
  additionalFilters,
  hasActiveAdditionalFilters = false,
  titleAs = 'h4',
  restoreFocus,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const { fromParty } = usePartyRepresentation();
  const localRestoreFocus = useRestoreFocus();
  const activeRestoreFocus = restoreFocus ?? localRestoreFocus;
  const [pendingFocusId, setPendingFocusId] = useState<string | null>(null);
  const wasActionLoading = useRef(false);
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

  const showDirectNoResults = isQuery && !directHasResults && indirectHasResults;
  const showIndirectList = isQuery && indirectHasResults && canDelegate;
  const showEmptyState = isQuery && !directHasResults && !indirectHasResults;

  // After an inline delegate/revoke settles (isActionLoading falls true -> false), restore focus to
  // the acted-on row. If the row is gone (e.g. revoked), RestoreFocusFallback picks it up instead.
  useEffect(() => {
    const settled = wasActionLoading.current && !isActionLoading;
    wasActionLoading.current = isActionLoading;
    if (!pendingFocusId || !settled) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      activeRestoreFocus.requestFocus(userRowFocusId(pendingFocusId));
      setPendingFocusId(null);
    });

    return () => cancelAnimationFrame(frame);
  }, [activeRestoreFocus, isActionLoading, pendingFocusId]);

  const runInlineAction = (action: UserSearchAction, user: UserActionTarget) => {
    setPendingFocusId(user.id);
    action(user);
  };

  const handleAddNewUser = async (user: User) => {
    if (onAddNewUser) {
      if (user?.id && user?.name) {
        onAddNewUser(user);
      }
    }
  };

  if (isLoading) {
    return (
      <RestoreFocusProvider restoreFocus={activeRestoreFocus}>
        <UserList
          isLoading={true}
          searchString={query}
        />
      </RestoreFocusProvider>
    );
  }
  return (
    <RestoreFocusProvider restoreFocus={activeRestoreFocus}>
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
          <RestoreFocusFallback>
            <>
              {!hasDirectUsers && !isLoading && !isQuery && (
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
              {isQuery && showIndirectList && (
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
                onRevoke={onRevoke ? (user) => runInlineAction(onRevoke, user) : undefined}
                onSelect={onSelect}
                includeSelfAsChild={includeSelfAsChild}
                getUserLink={getUserLink}
                titleAs={titleAs}
                revokeLabel={revokeLabel}
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
                  onDelegate={
                    canDelegate && onDelegate
                      ? (user) => runInlineAction(onDelegate, user)
                      : undefined
                  }
                  onSelect={onSelect}
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
          </RestoreFocusFallback>
        </div>
      </div>
    </RestoreFocusProvider>
  );
};

export default UserSearch;
