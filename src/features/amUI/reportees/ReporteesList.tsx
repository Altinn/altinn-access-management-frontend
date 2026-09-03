import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsSearch, DsSwitch } from '@altinn/altinn-components';

import { UserList } from '../common/UserList/UserList';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';
import { filterDeletedConnections } from '../common/deletedPartyUtils';

import classes from './ReporteePage.module.css';

import { debounce } from '@/resources/utils';
import { ConnectionUserType, useGetRightHoldersQuery } from '@/rtk/features/connectionApi';
import { PartyType } from '@/rtk/features/userInfoApi';

export const ReporteesList = () => {
  const { t } = useTranslation();
  const { toParty, isLoading: loadingPartyRepresentation, actingParty } = usePartyRepresentation();
  const [includeClientDelegations, setIncludeClientDelegations] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  const { data: rightHolders, isLoading: loadingRightHolders } = useGetRightHoldersQuery(
    {
      partyUuid: actingParty?.partyUuid ?? '',
      fromUuid: '', // all
      toUuid: toParty?.partyUuid ?? '',
      includeClientDelegations,
      includeAgentConnections: true,
    },
    {
      skip: !toParty?.partyUuid || !actingParty?.partyUuid,
    },
  );

  const filterRightHolders = useMemo(() => {
    const relevantRightHolders =
      rightHolders?.filter(
        (rh) =>
          (rh.party.type === ConnectionUserType.Person ||
            rh.party.type === ConnectionUserType.Organization) &&
          rh.party.partyId !== actingParty?.partyId,
      ) ?? [];

    return showDeleted ? relevantRightHolders : filterDeletedConnections(relevantRightHolders);
  }, [rightHolders, actingParty?.partyId, showDeleted]);

  const [searchString, setSearchString] = useState<string>('');

  const onSearch = useCallback(
    debounce((newSearchString: string) => {
      setSearchString(newSearchString);
    }, 300),
    [],
  );

  return (
    <div className={classes.usersList}>
      <div className={classes.search}>
        <DsSearch
          className={classes.searchBar}
          data-size='sm'
        >
          <DsSearch.Input
            aria-label={t('users_page.user_search_placeholder')}
            placeholder={t('users_page.user_search_placeholder')}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => onSearch(event.target.value)}
          />
          <DsSearch.Clear
            onClick={() => {
              setSearchString('');
            }}
          />
        </DsSearch>
        <div className={classes.searchControls}>
          {actingParty?.partyTypeName === PartyType.Person && (
            // This is ony relevant for private persons looking at their reportees,
            // as they can have access from clients that they might want to filter out
            <DsSwitch
              data-size='sm'
              checked={includeClientDelegations}
              onChange={(event) => setIncludeClientDelegations(event.target.checked)}
              label={t('reportees_page.show_clients_toggle')}
            />
          )}
          <DsSwitch
            data-size='sm'
            checked={showDeleted}
            onChange={(event) => setShowDeleted(event.target.checked)}
            label={t('common.show_deleted')}
          />
        </div>
      </div>
      <UserList
        connections={filterRightHolders}
        searchString={searchString}
        isLoading={loadingRightHolders || loadingPartyRepresentation}
        interactive
        canAdd={false} // Cannot add new reportees
        showRoles={false} // Roles are not shown for reportees
        roleDirection='fromUser' // Roles are from the User
      />
    </div>
  );
};
