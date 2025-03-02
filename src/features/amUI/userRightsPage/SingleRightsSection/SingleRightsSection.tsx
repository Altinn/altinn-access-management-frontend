import { Heading } from '@digdir/designsystemet-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { useGetSingleRightsForRightholderQuery } from '@/rtk/features/singleRights/singleRightsApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { List } from '@/features/amUI/common/List/List';
import usePagination from '@/resources/hooks/usePagination';
import { useGetPartyByUUIDQuery } from '@/rtk/features/lookupApi';
import { AmPagination } from '@/components/Paginering';

import { DelegationModal, DelegationType } from '../DelegationModal/DelegationModal';

import classes from './SingleRightsSection.module.css';
import SingleRightItem from './SingleRightItem';

export const SingleRightsSection = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  const {
    data: singleRights,
    isError,
    isLoading,
  } = useGetSingleRightsForRightholderQuery({
    party: getCookie('AltinnPartyId'),
    userId: id || '',
  });

  const { data: party } = useGetPartyByUUIDQuery(id ?? '');
  const { paginatedData, totalPages, currentPage, goToPage } = usePagination(singleRights ?? [], 5);

  return (
    party && (
      <div className={classes.singleRightsSectionContainer}>
        <Heading
          level={2}
          size='xs'
          id='single_rights_title'
        >
          {t('single_rights.current_services_title', { count: singleRights?.length })}
        </Heading>
        <DelegationModal
          toParty={party}
          delegationType={DelegationType.SingleRights}
        />
        {isError && <div>{t('user_rights_page.error')}</div>}
        {isLoading && <div>{t('user_rights_page.loading')}</div>}

        <List
          className={classes.singleRightsList}
          aria-labelledby='single_rights_title'
          spacing
          background
        >
          {paginatedData.map((delegation) => (
            <SingleRightItem
              key={delegation.resource?.identifier}
              toParty={party}
              resource={delegation.resource}
            />
          ))}
        </List>
        <div className={classes.tools}>
          {totalPages > 1 && (
            <AmPagination
              className={classes.pagination}
              totalPages={totalPages}
              currentPage={currentPage}
              setCurrentPage={goToPage}
              size='sm'
              hideLabels
            />
          )}
        </div>
      </div>
    )
  );
};
