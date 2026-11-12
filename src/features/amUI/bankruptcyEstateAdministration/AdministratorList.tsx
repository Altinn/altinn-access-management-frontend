import React from 'react';
import { useTranslation } from 'react-i18next';
import { DsAlert, DsParagraph, List } from '@altinn/altinn-components';

import { useGetAdministratorsQuery } from '@/rtk/features/bankruptcyEstateApi';

import { SearchHitsStatus } from '../common/SearchHitsStatus/SearchHitsStatus';
import { SkeletonUserList } from '../common/UserList/SkeletonUserList';

import { AdministratorListItem } from './AdministratorListItem';

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
  const visibleAdministrators = query
    ? administrators.filter(({ administrator }) =>
        administrator.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
      )
    : administrators;

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
