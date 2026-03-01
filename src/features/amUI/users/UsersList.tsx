import { useCallback, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { DsHeading, DsParagraph, DsSearch, DsSwitch } from '@altinn/altinn-components';

import type { User } from '@/rtk/features/userInfoApi';
import { PartyType, useGetIsAdminQuery } from '@/rtk/features/userInfoApi';
import {
  type Connection,
  ConnectionUserType,
  useGetRightHoldersQuery,
} from '@/rtk/features/connectionApi';
import { debounce } from '@/resources/utils';

import { UserList } from '../common/UserList/UserList';
import { CurrentUserPageHeader } from '../common/CurrentUserPageHeader/CurrentUserPageHeader';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';

import classes from './UsersList.module.css';
import { NewUserButton } from './NewUserModal/NewUserModal';
import { useSelfConnection } from '../common/PartyRepresentationContext/useSelfConnection';
import { displayPrivDelegation } from '@/resources/utils/featureFlagUtils';
import { ECC_PROVIDER_CODE, useRoleMetadata } from '../common/UserRoles/useRoleMetadata';

export const UsersList = () => {
  const { t } = useTranslation();
  const { fromParty, isLoading: loadingPartyRepresentation } = usePartyRepresentation();
  const shouldDisplayPrivDelegation = displayPrivDelegation();
  const navigate = useNavigate();
  const { data: isAdmin } = useGetIsAdminQuery();
  const [includeAgentConnections, setIncludeAgentConnections] = useState(false);

  const { data: rightHolders, isLoading: loadingRightHolders } = useGetRightHoldersQuery(
    {
      partyUuid: fromParty?.partyUuid ?? '',
      fromUuid: fromParty?.partyUuid ?? '',
      toUuid: '', // all
      includeAgentConnections:
        fromParty?.partyTypeName === PartyType.Person || includeAgentConnections,
    },
    {
      skip: !fromParty || !isAdmin,
    },
  );
  const { partyConnection: currentUser, isLoading: currentUserLoading } = useSelfConnection();

  const handleNewUser = (user: User) => {
    navigate(`/users/${user.id}`);
  };

  const [searchString, setSearchString] = useState<string>('');

  const {
    mapRoles,
    isLoading: loadingRoleMetadata,
    isError: roleMetadataError,
  } = useRoleMetadata();

  const connectionsWithRoles = useMemo(() => {
    if (!rightHolders) {
      return undefined;
    }

    const removeUuid = shouldDisplayPrivDelegation ? currentUser?.party.id : undefined;

    const mapConnection = (connection: Connection): Connection => {
      const connectionRoles = mapRoles(connection.roles).filter(
        (r) => r.provider?.code === ECC_PROVIDER_CODE,
      );

      return {
        ...connection,
        roles: connectionRoles,
        connections: connection.connections?.map(mapConnection) ?? [],
      };
    };

    return rightHolders.reduce<Connection[]>((acc, connection) => {
      if (
        connection.party.id === removeUuid ||
        connection.party.type === ConnectionUserType.Systemuser
      ) {
        return acc;
      }
      acc.push(mapConnection(connection));
      return acc;
    }, []);
  }, [
    rightHolders,
    mapRoles,
    shouldDisplayPrivDelegation,
    currentUser?.party.id,
    roleMetadataError,
    loadingRoleMetadata,
  ]);

  const currentUserWithRoles = useMemo(() => {
    if (!currentUser) {
      return undefined;
    }

    const connectionRoles = mapRoles(currentUser.roles).filter(
      (r) => r.provider?.code === ECC_PROVIDER_CODE,
    );

    return {
      ...currentUser,
      roles: connectionRoles,
    };
  }, [currentUser, mapRoles]);

  const onSearch = useCallback(
    debounce((newSearchString: string) => {
      setSearchString(newSearchString);
    }, 300),
    [],
  );

  return (
    <div className={classes.usersList}>
      {shouldDisplayPrivDelegation && (
        <>
          <CurrentUserPageHeader
            currentUser={currentUserWithRoles}
            roleNames={currentUserWithRoles?.roles?.map((role) => role?.name) ?? []}
            loading={!!(currentUserLoading || loadingPartyRepresentation || loadingRoleMetadata)}
            as={(props) =>
              currentUser ? (
                <Link
                  {...props}
                  to={`/users/${currentUser?.party.id ?? ''}`}
                />
              ) : (
                <div {...props} />
              )
            }
          />
        </>
      )}
      {isAdmin ? (
        <>
          <div className={classes.searchAndAddUser}>
            <div className={classes.filtersContainer}>
              <DsSearch
                className={classes.searchBar}
                data-size='sm'
              >
                <DsSearch.Input
                  aria-label={t('users_page.user_search_placeholder')}
                  placeholder={t('users_page.user_search_placeholder')}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    onSearch(event.target.value)
                  }
                />
                <DsSearch.Clear
                  onClick={() => {
                    setSearchString('');
                  }}
                />
              </DsSearch>
              {fromParty?.partyTypeName === PartyType.Organization && (
                <DsSwitch
                  data-size={'sm'}
                  checked={includeAgentConnections}
                  onChange={(event) => setIncludeAgentConnections(event.target.checked)}
                  label={t('users_page.show_users_with_client_access')}
                />
              )}
            </div>
            <div className={classes.addUserContainer}>
              <DsHeading
                level={2}
                data-size='sm'
                id='user_list_heading_id'
                className={classes.usersListHeading}
              >
                {t('users_page.user_list_heading')}
              </DsHeading>
              <NewUserButton onComplete={handleNewUser} />
            </div>
          </div>
          <UserList
            connections={connectionsWithRoles}
            searchString={searchString}
            isLoading={
              !connectionsWithRoles ||
              loadingRightHolders ||
              loadingPartyRepresentation ||
              loadingRoleMetadata
            }
            listItemTitleAs='h2'
            interactive={isAdmin}
          />
        </>
      ) : (
        <div className={classes.noAccessContainer}>
          <DsHeading
            data-size='xs'
            level={4}
          >
            {t('users_page.no_access_to_users_header')}
          </DsHeading>

          <DsParagraph>
            <Trans
              i18nKey='users_page.no_access_to_users_message'
              components={{ br: <br /> }}
            />
          </DsParagraph>
        </div>
      )}
    </div>
  );
};
