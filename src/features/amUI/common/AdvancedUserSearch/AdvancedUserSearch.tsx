import React, { useMemo, useState } from 'react';
import { DsSearch, DsParagraph, List, Button } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { Connection, ExtendedUser, User } from '@/rtk/features/userInfoApi';
import { NewUserButton } from '@/features/amUI/users/NewUserModal/NewUserModal';
import { UserItem } from '@/features/amUI/common/UserList/UserItem';

import classes from './AdvancedUserSearch.module.css';
import { useFilteredUsers } from '../UserList/useFilteredUsers';
import { DelegateAccessPackageActionControl } from '../AccessPackageList/DelegateAccessPackageActionControl';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';
import { DelegationAction } from '../DelegationModal/EditModal';
import { ExtendedAccessPackage } from '../AccessPackageList/useAreaPackageList';
import { RevokeRoleButton } from '../RoleList/RevokeRoleButton';
import { MinusCircleIcon, PlusCircleIcon } from '@navikt/aksel-icons';
import { M } from 'vitest/dist/chunks/reporters.d.BFLkQcL6';

export interface AdvancedUserSearchProps {
  connections?: Connection[];
  indirectConnections?: Connection[];
  accessPackage?: ExtendedAccessPackage;
  onSelect?: (userId: string) => void;
  onDelegate?: (userId: string) => void;
  onRevoke?: (userId: string) => void;
  onRequest?: (userId: string) => void;
  availableActions?: DelegationAction[];
  isActionLoading?: boolean;
  canDelegate?: boolean;
}

export const AdvancedUserSearch: React.FC<AdvancedUserSearchProps> = ({
  connections,
  indirectConnections,

  accessPackage,
  onSelect,
  onDelegate,
  onRevoke,
  onRequest,
  canDelegate = true,
  isActionLoading = false,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const isSm = useIsMobileOrSmaller();

  const { users, indirectUsers } = useFilteredUsers({
    connections,
    indirectConnections,
    searchString: query,
  });

  return (
    <div className={classes.container}>
      <div className={classes.controls}>
        <DsSearch>
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
        {users?.length > 0 && (
          <>
            <h3 className={classes.subHeader}>{t('users_page.direct_connections')}</h3>
            <List spacing={2}>
              {users?.map((user) => (
                <UserItem
                  key={user.id}
                  user={user}
                  size='md'
                  interactive={false}
                  showRoles={true}
                  roleDirection='toUser'
                  disableLinks
                  controls={
                    !isSm && (
                      <Button
                        variant='text'
                        onClick={() => onRevoke?.(user.id)}
                        icon={<MinusCircleIcon />}
                      >
                        {t('common.delete_poa')}
                      </Button>
                    )
                  }
                />
              ))}
            </List>
          </>
        )}
        {indirectUsers && indirectUsers.length > 0 && (
          <>
            <h3 className={classes.subHeader}>{t('users_page.indirect_connections')}</h3>
            <List spacing={2}>
              {indirectUsers.map((user) => (
                <UserItem
                  key={user.id}
                  user={user}
                  size='md'
                  interactive={false}
                  showRoles={true}
                  roleDirection='toUser'
                  disableLinks
                  controls={
                    !isSm && (
                      <Button
                        variant='text'
                        onClick={() => onDelegate?.(user.id)}
                        disabled={accessPackage?.isAssignable === false}
                        icon={<PlusCircleIcon />}
                      >
                        {t('common.give_poa')}
                      </Button>
                    )
                  }
                />
              ))}
            </List>
          </>
        )}
        {users?.length === 0 && (!indirectUsers || indirectUsers?.length === 0) && (
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
