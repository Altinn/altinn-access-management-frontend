import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsParagraph, Switch } from '@altinn/altinn-components';

import { type Client, useGetClientsQuery } from '@/rtk/features/clientApi';

import { UserSearch } from '../common/UserSearch/UserSearch';
import { buildClientParentNameById, buildClientSortKey } from '../common/clientSortUtils';
import { mapEntityToUserSearchNode } from '../common/UserSearch/mapperUtils';
import type { UserSearchNode } from '../common/UserSearch/types';
import { filterDeletedParties } from '../common/deletedPartyUtils';

import { SelectRoleFilter } from './SelectRoleFilter';
import classes from './ClientAdministrationAgentsTab.module.css';

const buildClientUsers = (clients?: Client[]): UserSearchNode[] => {
  if (!clients?.length) return [];

  const parentNameById = buildClientParentNameById(clients);

  return clients.map((client) =>
    mapEntityToUserSearchNode(client.client, {
      sortKey: buildClientSortKey(client, parentNameById),
    }),
  );
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
    return filterDeletedParties(clients, (client) => client.client);
  }, [clients, showDeleted]);
  const users = useMemo(() => buildClientUsers(filteredClients), [filteredClients]);

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
              label={t('common.show_deleted')}
            />
          </div>
        }
      />
    </>
  );
};
