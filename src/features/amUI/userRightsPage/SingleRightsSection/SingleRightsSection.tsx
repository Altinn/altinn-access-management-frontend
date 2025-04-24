import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { DsHeading } from '@altinn/altinn-components';

import { DelegationModal, DelegationType } from '../../common/DelegationModal/DelegationModal';

import classes from './SingleRightsSection.module.css';
import SingleRightItem from './SingleRightItem';

import { useGetSingleRightsForRightholderQuery } from '@/rtk/features/singleRights/singleRightsApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { List } from '@/features/amUI/common/List/List';
import usePagination from '@/resources/hooks/usePagination';
import { useGetPartyByUUIDQuery } from '@/rtk/features/lookupApi';
import { AmPagination } from '@/components/Paginering';

export const SingleRightsSection = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const fromPartyId = getCookie('AltinnPartyId');
  const {
    data: singleRights,
    isError,
    isLoading,
  } = useGetSingleRightsForRightholderQuery({
    party: fromPartyId,
    userId: id || '',
  });

  const { data: toParty } = useGetPartyByUUIDQuery(id ?? '');
  const { paginatedData, totalPages, currentPage, goToPage } = usePagination(singleRights ?? [], 5);

  return (
    toParty && (
      <div className={classes.singleRightsSectionContainer}>
        <DsHeading
          level={2}
          data-size='xs'
          id='single_rights_title'
        >
          {t('single_rights.current_services_title', { count: singleRights?.length })}
        </DsHeading>
        <DelegationModal delegationType={DelegationType.SingleRights} />
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
              toParty={toParty}
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
