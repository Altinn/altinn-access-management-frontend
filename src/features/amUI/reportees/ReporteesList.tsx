import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsSearch } from '@altinn/altinn-components';

import { debounce } from '@/resources/utils';
import { useGetRightHoldersQuery } from '@/rtk/features/connectionApi';

import { UserList } from '../common/UserList/UserList';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';

import classes from './ReporteePage.module.css';

export const ReporteesList = () => {
  const { t } = useTranslation();
  const { toParty, isLoading: loadingPartyRepresentation, actingParty } = usePartyRepresentation();

  const { data: rightHolders, isLoading: loadingRightHolders } = useGetRightHoldersQuery(
    {
      partyUuid: actingParty?.partyUuid ?? '',
      fromUuid: '', // all
      toUuid: toParty?.partyUuid ?? '',
    },
    {
      skip: !toParty?.partyUuid || !actingParty?.partyUuid,
    },
  );

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
        <DsSearch className={classes.searchBar}>
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
      </div>
      <UserList
        connections={rightHolders || []}
        searchString={searchString}
        isLoading={loadingRightHolders || loadingPartyRepresentation}
        listItemTitleAs='h2'
        interactive
        canAdd={false} // Cannot add new reportees
        showRoles={false} // Roles are not shown for reportees
        roleDirection='fromUser' // Roles are from the User
      />
    </div>
  );
};
