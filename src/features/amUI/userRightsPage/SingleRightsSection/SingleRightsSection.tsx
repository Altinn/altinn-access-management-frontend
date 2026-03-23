import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { DsHeading, DsLink, DsParagraph, DsPopover } from '@altinn/altinn-components';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { useGetSingleRightsForRightholderQuery } from '@/rtk/features/singleRights/singleRightsApi';
import { ResourceList } from '@/features/amUI/common/ResourceList/ResourceList';

import { DelegationModal, DelegationType } from '../../common/DelegationModal/DelegationModal';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { DelegationAction, EditModal } from '../../common/DelegationModal/EditModal';

import classes from './SingleRightsSection.module.css';
import { DeleteResourceButton } from './DeleteResourceButton';
import { getRedirectToA2UsersListSectionUrl } from '@/resources/utils';
import { useCanGiveAccess } from '@/resources/hooks/useCanGiveAccess';
import { useIsTabletOrSmaller } from '@/resources/utils/screensizeUtils';
import { SingleRightsSectionSkeleton } from './SingleRightsSectionSkeleton';
import { getInheritedStatus } from '../../common/useInheritedStatus';
import { QuestionmarkCircleIcon } from '@navikt/aksel-icons';
import { PendingRequests } from './PendingRequests';

export const SingleRightsSection = ({ isReportee = false }: { isReportee?: boolean }) => {
  const { id } = useParams();
  const { t } = useTranslation();
  const isSmallScreen = useIsTabletOrSmaller();
  const { displayResourceDelegation } = window.featureFlags;
  const { toParty, fromParty, actingParty, isLoading: isPartyLoading } = usePartyRepresentation();

  const canGiveAccess = useCanGiveAccess(id ?? '', isReportee);
  const canRequestAccess =
    !canGiveAccess &&
    actingParty?.partyUuid === toParty?.partyUuid &&
    toParty?.partyUuid !== fromParty?.partyUuid &&
    window.featureFlags?.enableRequestAccess;

  const {
    data: delegatedResources,
    isError,
    isLoading,
  } = useGetSingleRightsForRightholderQuery(
    {
      actingParty: actingParty?.partyUuid || '',
      from: fromParty?.partyUuid || '',
      to: toParty?.partyUuid || '',
    },
    {
      skip: !displayResourceDelegation || !actingParty || !fromParty || !toParty,
    },
  );

  const modalRef = React.useRef<HTMLDialogElement>(null);
  const [selectedResource, setSelectedResource] = React.useState<ServiceResource | null>(null);

  const resources = React.useMemo(
    () => delegatedResources?.map((delegation) => delegation.resource).filter(Boolean),
    [delegatedResources],
  ) as ServiceResource[];

  const isResourceInherited = (resourceId: string) => {
    const resource = delegatedResources?.find(
      (delegation) => delegation.resource.identifier === resourceId,
    );
    if (!resource) return false;
    const inheritanceStatus = getInheritedStatus({
      permissions: resource.permissions,
      toParty,
      fromParty,
      actingParty,
    });
    return inheritanceStatus.length > 0;
  };

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

  if (isLoading || isPartyLoading) {
    return <SingleRightsSectionSkeleton />;
  }

  const availableActions = [
    DelegationAction.REVOKE,
    ...(canGiveAccess ? [DelegationAction.DELEGATE] : []),
    ...(canRequestAccess ? [DelegationAction.REQUEST] : []),
  ];

  return (
    toParty && (
      <div className={classes.singleRightsSectionContainer}>
        <div className={classes.headerContainer}>
          <DsHeading
            level={2}
            data-size='xs'
            id='single_rights_title'
          >
            {t('single_rights.current_services_title', { count: delegatedResources?.length ?? 0 })}
          </DsHeading>
          <DsPopover.TriggerContext>
            <DsPopover.Trigger
              icon
              variant='tertiary'
              aria-label={t('single_rights.helptext_button')}
            >
              <QuestionmarkCircleIcon />
            </DsPopover.Trigger>
            <DsPopover>{t('single_rights.helptext_content')}</DsPopover>
          </DsPopover.TriggerContext>
        </div>
        {isError && <div>{t('user_rights_page.error')}</div>}
        {availableActions.includes(DelegationAction.REQUEST) && <PendingRequests />}
        <div className={classes.singleRightsList}>
          <ResourceList
            resources={resources ?? []}
            enableSearch={true}
            showDetails={false}
            onSelect={(resource) => {
              setSelectedResource(resource);
              modalRef.current?.showModal();
            }}
            size={isSmallScreen ? 'sm' : 'md'}
            titleAs='h3'
            delegationModal={
              (availableActions.includes(DelegationAction.DELEGATE) ||
                availableActions.includes(DelegationAction.REQUEST)) && (
                <DelegationModal
                  delegationType={DelegationType.SingleRights}
                  availableActions={availableActions}
                />
              )
            }
            renderControls={(resource) => {
              const isInherited = isResourceInherited(resource.identifier);
              return (
                <DeleteResourceButton
                  resource={resource}
                  fullText={!isSmallScreen}
                  disabled={isInherited}
                />
              );
            }}
          />
        </div>
        <EditModal
          ref={modalRef}
          resource={selectedResource ?? undefined}
          onClose={() => setSelectedResource(null)}
          availableActions={availableActions}
        />
      </div>
    )
  );
};
