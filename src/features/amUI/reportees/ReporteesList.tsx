import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsSearch } from '@altinn/altinn-components';

import { UserList } from '../common/UserList/UserList';
import { usePartyRepresentation } from '../common/PartyRepresentationContext/PartyRepresentationContext';

import classes from './ReporteePage.module.css';

import { debounce } from '@/resources/utils';
import { useGetRightHoldersQuery } from '@/rtk/features/userInfoApi';

export const ReporteesList = () => {
  const { t } = useTranslation();
  const { fromParty } = usePartyRepresentation();

  const { data: rightHolders, isLoading } = useGetRightHoldersQuery(
    {
      partyUuid: fromParty?.partyUuid ?? '',
      fromUuid: '', // all
      toUuid: fromParty?.partyUuid ?? '',
    },
    {
      skip: !fromParty?.partyUuid,
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
        userList={rightHolders || []}
        searchString={searchString}
        isLoading={isLoading}
        listItemTitleAs='h2'
      />
    </div>
  );
};
