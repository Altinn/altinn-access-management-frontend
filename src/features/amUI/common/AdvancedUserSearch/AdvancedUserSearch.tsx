import React, { useMemo, useState } from 'react';
import { DsSearch, DsParagraph, formatDisplayName } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import { ExtendedUser, PartyType, User } from '@/rtk/features/userInfoApi';
import { ConnectionUserType, type Connection } from '@/rtk/features/connectionApi';
import { NewUserButton } from '@/features/amUI/users/NewUserModal/NewUserModal';

import classes from './AdvancedUserSearch.module.css';
import { useFilteredUsers } from '../UserList/useFilteredUsers';
import { DelegationAction } from '../DelegationModal/EditModal';
import { UserList } from '../UserList/UserList';
import { ConnectionsList } from './ConnectionsList';
import { usePartyRepresentation } from '../PartyRepresentationContext/PartyRepresentationContext';

export interface AdvancedUserSearchProps {
  includeSelfAsChild: boolean;
  includeSelfAsChildOnIndirect?: boolean;
  connections?: Connection[];
  indirectConnections?: Connection[];
  getUserLink?: (user: ExtendedUser) => string;
  onDelegate?: (user: User) => void;
  onAddNewUser?: (user: User) => void;
  onRevoke?: (user: User) => void;
  isLoading?: boolean;
  isActionLoading?: boolean;
  canDelegate?: boolean;
  AddUserButton?: React.ComponentType<{ isLarge?: boolean; onComplete?: (user: User) => void }>;
  noUsersText?: string;
  searchPlaceholder?: string;
  addUserButtonLabel?: string;
  directConnectionsHeading?: string;
  indirectConnectionsHeading?: string;
}

const filterAvailableUserTypes = (items?: Connection[]) =>
  items?.filter(
    (item) =>
      item.party.type === ConnectionUserType.Person ||
      item.party.type === ConnectionUserType.Organization,
  ) || [];

export const AdvancedUserSearch: React.FC<AdvancedUserSearchProps> = ({
  includeSelfAsChild,
  includeSelfAsChildOnIndirect = true,
  connections,
  indirectConnections,
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
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const { fromParty } = usePartyRepresentation();
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

  const hasDirectConnections = (connections?.length ?? 0) > 0;
  const directHasResults = (users?.length ?? 0) > 0;
  const indirectHasResults = (indirectUsers?.length ?? 0) > 0;

  const showDirectNoResults = isQuery && !directHasResults && indirectHasResults;
  const showIndirectList = isQuery && indirectHasResults && canDelegate;
  const showEmptyState = !directHasResults && !indirectHasResults && hasDirectConnections;

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
        <DsSearch className={classes.searchBar}>
          <DsSearch.Input
            aria-label={t('common.search')}
            placeholder={searchPlaceholder ?? t('advanced_user_search.user_search_placeholder')}
            value={query}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
          />
          {query && <DsSearch.Clear onClick={() => setQuery('')} />}
        </DsSearch>
        {canDelegate && AddUserButton && (
          <div className={classes.buttonRow}>
            <AddUserButton onComplete={handleAddNewUser} />
          </div>
        )}
      </div>

      <div className={classes.results}>
        <>
          {!hasDirectConnections && !isLoading && (
            <DsParagraph
              data-size='sm'
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
          <ConnectionsList
            users={users as ExtendedUser[]}
            hasNextPage={hasNextPage}
            goNextPage={goNextPage}
            availableAction={DelegationAction.REVOKE}
            isActionLoading={isActionLoading}
            onRevoke={onRevoke}
            includeSelfAsChild={includeSelfAsChild}
            getUserLink={getUserLink}
          />
          {showDirectNoResults && (
            <DsParagraph data-size='md'>
              {t('advanced_user_search.user_no_search_result', { searchTerm: trimmedQuery })}
            </DsParagraph>
          )}
        </>

        {showIndirectList && (
          <>
            <h3 className={classes.subHeader}>
              {indirectConnectionsHeading ?? t('advanced_user_search.indirect_connections')}
            </h3>
            <ConnectionsList
              users={indirectUsers as ExtendedUser[]}
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
                  ? 'advanced_user_search.user_no_search_result_with_add_suggestion'
                  : 'advanced_user_search.user_no_search_result',
                { searchTerm: trimmedQuery },
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

export default AdvancedUserSearch;
