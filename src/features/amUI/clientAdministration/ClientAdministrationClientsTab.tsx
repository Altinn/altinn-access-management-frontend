import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsParagraph, Switch } from '@altinn/altinn-components';

import { UserSearch } from '../common/UserSearch/UserSearch';
import { type Client, useGetClientsQuery } from '@/rtk/features/clientApi';
import { type Connection } from '@/rtk/features/connectionApi';
import { buildClientParentNameById, buildClientSortKey } from '../common/clientSortUtils';
import { SelectRoleFilter } from './SelectRoleFilter';
import classes from './ClientAdministrationAgentsTab.module.css';
import { mapConnectionsToUserSearchNodes } from '../common/UserSearch/mappers';

const buildClientConnections = (clients?: Client[]): Connection[] => {
  if (!clients?.length) return [];

  const parentNameById = buildClientParentNameById(clients);

  return clients.map((client) => {
    const sortKey = buildClientSortKey(client, parentNameById);
    return {
      party: {
        ...client.client,
        children: null,
        parent: null,
        roles: [],
        isDeleted: client.client.isDeleted ?? undefined,
      },
      sortKey,
      roles: [],
      connections: [],
    };
  });
};

type ClientAdministrationClientsTabProps = {
  isActive: boolean;
};

export const ClientAdministrationClientsTab = ({
  isActive,
}: ClientAdministrationClientsTabProps) => {
  const { t } = useTranslation();
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);

  const {
    data: clients,
    isLoading: isClientsLoading,
    isError: isClientsError,
  } = useGetClientsQuery(
    { roles: roleFilter },
    {
      skip: !isActive,
    },
  );

  const filteredClients = useMemo(() => {
    if (!clients || showDeleted) {
      return clients;
    }
    return clients.filter((client) => !client.client?.isDeleted);
  }, [clients, showDeleted]);
  const clientConnections = useMemo<Connection[]>(
    () => buildClientConnections(filteredClients),
    [filteredClients],
  );
  const users = useMemo(
    () => mapConnectionsToUserSearchNodes(clientConnections),
    [clientConnections],
  );

  if (isClientsError) {
    return (
      <DsAlert
        role='alert'
        data-color='danger'
      >
        <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
      </DsAlert>
    );
  }

  return (
    <>
      <UserSearch
        includeSelfAsChild={true}
        users={users}
        isLoading={isClientsLoading}
        canDelegate={false}
        searchPlaceholder={t('client_administration_page.client_search_placeholder')}
        noUsersText={t('client_administration_page.no_clients')}
        getUserLink={(user) => `/clientadministration/client/${user.id}`}
        hasActiveAdditionalFilters={roleFilter.length > 0}
        additionalFilters={
          <div className={classes.filters}>
            <SelectRoleFilter
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
            />
            <Switch
              onChange={(e) => setShowDeleted(e.target.checked)}
              checked={showDeleted}
              label={t('client_administration_page.show_deleted_clients')}
            />
          </div>
        }
      />
    </>
  );
};
