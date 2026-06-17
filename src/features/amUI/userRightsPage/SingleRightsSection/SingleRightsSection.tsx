import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { DsHeading, DsPopover } from '@altinn/altinn-components';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { useGetSingleRightsForRightholderQuery } from '@/rtk/features/singleRights/singleRightsApi';
import { ResourceList } from '@/features/amUI/common/ResourceList/ResourceList';

import { DelegationModal, DelegationType } from '../../common/DelegationModal/DelegationModal';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { DelegationAction, EditModal } from '../../common/DelegationModal/EditModal';
import {
  RestoreFocusFallback,
  RestoreFocusProvider,
  useRestoreFocus,
  useRestoreFocusAfterSettled,
} from '../../common/RestoreFocus';

import classes from './SingleRightsSection.module.css';
import { DeleteResourceButton } from './DeleteResourceButton';
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
    isFetching,
    isLoading,
  } = useGetSingleRightsForRightholderQuery(
    {
      actingParty: actingParty?.partyUuid || '',
      from: fromParty?.partyUuid || '',
      to: toParty?.partyUuid || '',
    },
    {
      skip: !actingParty || !fromParty || !toParty,
    },
  );

  const modalRef = React.useRef<HTMLDialogElement>(null);
  const [selectedResource, setSelectedResource] = React.useState<ServiceResource | null>(null);

  const resources = React.useMemo(
    () => delegatedResources?.map((delegation) => delegation.resource).filter(Boolean) ?? [],
    [delegatedResources],
  ) as ServiceResource[];

  // Restore focus to the service item that opened the modal when it closes, and fall back to the
  // heading when an inline delete removes the item entirely.
  const restoreFocus = useRestoreFocus();
  const restoreFocusAfterDelete = useRestoreFocusAfterSettled<string>({
    isSettling: isFetching,
    onRestore: restoreFocus.requestFocus,
  });
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
      <RestoreFocusProvider restoreFocus={restoreFocus}>
        <div className={classes.singleRightsSectionContainer}>
          <div className={classes.headerContainer}>
            <RestoreFocusFallback>
              <DsHeading
                level={2}
                data-size='xs'
                id='single_rights_title'
              >
                {t('single_rights.current_services_title', {
                  count: delegatedResources?.length ?? 0,
                })}
              </DsHeading>
            </RestoreFocusFallback>
            <DsPopover.TriggerContext>
              <DsPopover.Trigger
                icon
                variant='tertiary'
                aria-label={t('single_rights.helptext_button')}
              >
                <QuestionmarkCircleIcon aria-hidden='true' />
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
              noResourcesText={t('resource_list.no_user_resources')}
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
                if (isSmallScreen) return null;
                const isInherited = isResourceInherited(resource.identifier);
                return (
                  <DeleteResourceButton
                    resource={resource}
                    disabled={isInherited}
                    onSuccess={() => restoreFocusAfterDelete(resource.identifier)}
                  />
                );
              }}
            />
          </div>
          <EditModal
            ref={modalRef}
            resource={selectedResource ?? undefined}
            onClose={() => {
              if (selectedResource) {
                restoreFocus.requestFocus(selectedResource.identifier);
              }
              setSelectedResource(null);
            }}
            availableActions={availableActions}
          />
        </div>
      </RestoreFocusProvider>
    )
  );
};
