import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { DsHeading } from '@altinn/altinn-components';

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

export const SingleRightsSection = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const fromPartyId = getCookie('AltinnPartyId');
  const {
    data: singleRights,
    isError,
    error,
    isLoading,
  } = useGetSingleRightsForRightholderQuery({
    party: fromPartyId,
    userId: id || '',
  });

  const { toParty } = usePartyRepresentation();
  const { paginatedData, totalPages, currentPage, goToPage } = usePagination(singleRights ?? [], 5);
  const modalRef = React.useRef<HTMLDialogElement>(null);
  const [selectedResource, setSelectedResource] = React.useState<ServiceResource | null>(null);

  const resources = React.useMemo(
    () => paginatedData.map((delegation) => delegation.resource).filter(Boolean),
    [paginatedData],
  ) as ServiceResource[];

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
            enableSearch={false}
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
                toParty={toParty}
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
