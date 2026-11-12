import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsParagraph, List } from '@altinn/altinn-components';

import { formatEntityDisplayName } from '@/resources/utils/reporteeUtils';
import {
  useGetAdministratorsQuery,
  type BankruptcyEstateAdministrator,
} from '@/rtk/features/bankruptcyEstateApi';

import { isNewUser } from '../common/isNewUser';
import { SearchHitsStatus } from '../common/SearchHitsStatus/SearchHitsStatus';
import { SkeletonUserList } from '../common/UserList/SkeletonUserList';
import { matchesUserListSearch } from '../common/UserListItems/UserListItems';

import { AdministratorListItem } from './AdministratorListItem';

/*** New administrators first, then by name, as the agents in client administration */
const getSortKey = ({ administrator, adminAddedAt }: BankruptcyEstateAdministrator) =>
  `${isNewUser(adminAddedAt) ? '0' : '1'}:${administrator.name.toLowerCase()}`;

interface AdministratorListProps {
  /*** Only administrators whose name contains this are shown. Empty shows everyone */
  searchString: string;
}

/*** The users who administer the bankruptcy estates of the selected trustee */
export const AdministratorList = ({ searchString }: AdministratorListProps) => {
  const { t } = useTranslation();
  const { data: administrators, isLoading, isError } = useGetAdministratorsQuery();

  if (isError) {
    return (
      <DsAlert
        role='alert'
        data-color='danger'
      >
        <DsParagraph>{t('common.general_error_paragraph')}</DsParagraph>
      </DsAlert>
    );
  }

  if (isLoading) {
    return (
      <List>
        <SkeletonUserList />
      </List>
    );
  }

  if (!administrators?.length) {
    return (
      <DsParagraph>{t('bankruptcy_estate_administration_page.no_administrators')}</DsParagraph>
    );
  }

  const query = searchString.trim();
  const visibleAdministrators = administrators
    .filter(({ administrator }) =>
      matchesUserListSearch({ name: formatEntityDisplayName(administrator) }, query),
    )
    .sort((a, b) => getSortKey(a).localeCompare(getSortKey(b)));

  return (
    <>
      <SearchHitsStatus
        hits={query ? visibleAdministrators.length : undefined}
        searchString={query}
      />
      {visibleAdministrators.length === 0 ? (
        <DsParagraph>
          {t('advanced_user_search.user_no_search_result', { searchTerm: query })}
        </DsParagraph>
      ) : (
        <List>
          {visibleAdministrators.map(({ administrator, adminAddedAt }) => (
            <AdministratorListItem
              key={administrator.id}
              administrator={administrator}
              addedAt={adminAddedAt}
            />
          ))}
        </List>
      )}
    </>
  );
};
