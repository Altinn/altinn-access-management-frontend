import React, { useState } from 'react';
import { DsSearch, DsParagraph, List, Button } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { Connection } from '@/rtk/features/userInfoApi';
import { NewUserButton } from '@/features/amUI/users/NewUserModal/NewUserModal';
import { UserItem } from '@/features/amUI/common/UserList/UserItem';

import classes from './AdvancedUserSearch.module.css';
import { useFilteredUsers } from '../UserList/useFilteredUsers';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import { DelegationAction } from '../DelegationModal/EditModal';
import { ExtendedAccessPackage } from '../AccessPackageList/useAreaPackageList';
import { UserList } from '../UserList/UserList';
import { UserListActions } from '../UserList/UserListActions';

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
  canDelegate = true,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const isSm = useIsMobileOrSmaller();

  const { users, hasNextPage, goNextPage, indirectUsers, hasNextIndirectPage, goNextIndirectPage } =
    useFilteredUsers({
      connections,
      indirectConnections,
      searchString: query,
    });
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
            placeholder={t('common.search')}
            value={query}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
          />
          {query && <DsSearch.Clear onClick={() => setQuery('')} />}
        </DsSearch>
      </div>

      <div className={classes.results}>
        {(indirectUsers && indirectUsers?.length > 0) || (users && users?.length > 0) ? (
          <>
            <h3 className={classes.subHeader}>{t('users_page.direct_connections')}</h3>
            {connections && connections.length > 0 && (
              <>
                <List spacing={2}>
                  {users.map((user) => (
                    <UserItem
                      key={user.id}
                      user={user}
                      size='md'
                      titleAs='h4'
                      interactive={false}
                      showRoles={true}
                      roleDirection='toUser'
                      disableLinks
                      controls={
                        isSm ? null : (
                          <UserListActions
                            userId={user.id}
                            userName={user.name}
                            availableAction={DelegationAction.REVOKE}
                            onRevoke={onRevoke}
                          />
                        )
                      }
                    />
                  ))}
                </List>
                {hasNextPage && (
                  <div className={classes.showMoreButtonContainer}>
                    <Button
                      className={classes.showMoreButton}
                      onClick={goNextPage}
                      disabled={!hasNextPage}
                      variant='outline'
                      size='md'
                    >
                      {t('common.show_more')}
                    </Button>
                  </div>
                )}
              </>
            )}
            {indirectUsers && indirectUsers.length > 0 && query && (
              <>
                <hr />
                <h3 className={classes.subHeader}>{t('users_page.indirect_connections')}</h3>

                <List spacing={2}>
                  {indirectUsers?.map((user) => (
                    <UserItem
                      key={user.id}
                      user={user}
                      size='md'
                      titleAs='h4'
                      interactive={false}
                      showRoles={true}
                      roleDirection='toUser'
                      disableLinks
                      controls={
                        isSm ? null : (
                          <UserListActions
                            userId={user.id}
                            userName={user.name}
                            availableAction={DelegationAction.DELEGATE}
                            onDelegate={onDelegate}
                          />
                        )
                      }
                    />
                  ))}
                </List>
                {hasNextIndirectPage && (
                  <div className={classes.showMoreButtonContainer}>
                    <Button
                      className={classes.showMoreButton}
                      onClick={goNextIndirectPage}
                      disabled={!hasNextIndirectPage}
                      variant='outline'
                      size='md'
                    >
                      {t('common.show_more')}
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className={classes.emptyState}>
            <DsParagraph data-size='md'>
              {t('users_page.user_no_search_result_with_add_suggestion', { searchTerm: query })}
            </DsParagraph>
            <NewUserButton isLarge />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedUserSearch;
