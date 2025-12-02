import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { DsHeading, DsLink, DsParagraph } from '@altinn/altinn-components';

import { useGetSingleRightsForRightholderQuery } from '@/rtk/features/singleRights/singleRightsApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { List } from '@/features/amUI/common/List/List';
import usePagination from '@/resources/hooks/usePagination';
import { AmPagination } from '@/components/Paginering';

import { DelegationModal, DelegationType } from '../../common/DelegationModal/DelegationModal';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';

import classes from './SingleRightsSection.module.css';
import SingleRightItem from './SingleRightItem';
import { getRedirectToA2UsersListSectionUrl } from '@/resources/utils';

export const SingleRightsSection = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const fromPartyId = getCookie('AltinnPartyId');
  const { displayResourceDelegation } = window.featureFlags;

  const {
    data: singleRights,
    isError,
    isLoading,
  } = useGetSingleRightsForRightholderQuery(
    {
      party: fromPartyId,
      userId: id || '',
    },
    {
      skip: !displayResourceDelegation,
    },
  );

  const { toParty, fromParty, actingParty } = usePartyRepresentation();
  const { paginatedData, totalPages, currentPage, goToPage } = usePagination(singleRights ?? [], 5);

  const sectionId = fromParty?.partyUuid === actingParty?.partyUuid ? 9 : 8; // Section for "Users (A2)" in Profile is 9, for "Accesses for others (A2)" it is 8
  const A2url = getRedirectToA2UsersListSectionUrl(sectionId);

  if (!displayResourceDelegation) {
    return (
      <div className={classes.singleRightsSectionContainer}>
        <DsHeading
          level={2}
          data-size='xs'
          id='single_rights_title'
        >
          {t('single_rights.wip_title')}
        </DsHeading>
        <div className={classes.wipMessage}>
          <DsParagraph>{t('single_rights.wip_message')}</DsParagraph>
          <DsLink asChild>
            <Link to={A2url}>{t('single_rights.wip_link_text')}</Link>
          </DsLink>
        </div>
      </div>
    );
  }

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
