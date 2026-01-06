import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { DsHeading, DsLink, DsParagraph } from '@altinn/altinn-components';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { useGetSingleRightsForRightholderQuery } from '@/rtk/features/singleRights/singleRightsApi';
import { getCookie } from '@/resources/Cookie/CookieMethods';
import { ResourceList } from '@/features/amUI/common/ResourceList/ResourceList';
import usePagination from '@/resources/hooks/usePagination';
import { AmPagination } from '@/components/Paginering';

import { DelegationModal, DelegationType } from '../../common/DelegationModal/DelegationModal';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { EditModal } from '../../common/DelegationModal/EditModal';

import classes from './SingleRightsSection.module.css';
import { DeleteResourceButton } from './DeleteResourceButton';
import { getRedirectToA2UsersListSectionUrl } from '@/resources/utils';

export const SingleRightsSection = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const fromPartyId = getCookie('AltinnPartyId');
  const { displayResourceDelegation } = window.featureFlags;

  const {
    data: singleRights,
    isError,
    error,
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
  const modalRef = React.useRef<HTMLDialogElement>(null);
  const [selectedResource, setSelectedResource] = React.useState<ServiceResource | null>(null);

  const resources = React.useMemo(
    () => paginatedData.map((delegation) => delegation.resource).filter(Boolean),
    [paginatedData],
  ) as ServiceResource[];

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

        <div className={classes.singleRightsList}>
          <ResourceList
            resources={resources}
            enableSearch={true}
            showMoreButton={false}
            showDetails={false}
            onSelect={(resource) => {
              setSelectedResource(resource);
              modalRef.current?.showModal();
            }}
            size='md'
            titleAs='h3'
            renderControls={(resource) => (
              <DeleteResourceButton
                resource={resource}
                fullText
              />
            )}
          />
        </div>
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
        <EditModal
          ref={modalRef}
          resource={selectedResource ?? undefined}
          onClose={() => setSelectedResource(null)}
        />
      </div>
    )
  );
};
