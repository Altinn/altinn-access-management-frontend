import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { DsHeading } from '@altinn/altinn-components';

import { formatEntityDisplayName } from '@/resources/utils/reporteeUtils';
import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { useGetSingleRightsForRightholderQuery } from '@/rtk/features/singleRights/singleRightsApi';
import {
  RestoreFocusFallback,
  RestoreFocusProvider,
  useRestoreFocus,
  useRestoreFocusContext,
  useRestoreFocusOnDataChange,
} from '@/features/amUI/common/RestoreFocus';
import { useCanGiveAccess } from '@/resources/hooks/useCanGiveAccess';
import { useIsTabletOrSmaller } from '@/resources/utils/screensizeUtils';
import { useCanRequestAccess } from '@/resources/hooks/useCanRequestAccess';

import { SingleRightsDelegationModal } from '../../common/DelegationModal/SingleRights/SingleRightsDelegationModal';
import { usePartyRepresentation } from '../../common/PartyRepresentationContext/PartyRepresentationContext';
import { DelegationAction, EditModal } from '../../common/DelegationModal/EditModal';
import { ResourceInfo } from '../../common/DelegationModal/SingleRights/ResourceInfo';
import { getAvailableActions } from '../../common/DelegationModal/delegationActionUtils';
import { getInheritedStatus } from '../../common/useInheritedStatus';
import { HelpText } from '../../common/HelpText/HelpText';
import { useCanRedelegateResource, useRevokeConfirmation } from '../../common/RevokeConfirmation';
import { ServiceSearchLists } from '../../common/ServiceSearchLists/ServiceSearchLists';
import { useDelegationModalContext } from '../../common/DelegationModal/DelegationModalContext';
import { useSingleRightsListControls } from '../../common/DelegationModal/SingleRights/hooks/useSingleRightsListControls';

import classes from './SingleRightsSection.module.css';
import { DeleteResourceButton } from './DeleteResourceButton';
import { SingleRightsSectionSkeleton } from './SingleRightsSectionSkeleton';
import { PendingRequests } from './PendingRequests';

const SingleRightsSectionContent = ({ isReportee }: { isReportee: boolean }) => {
  const { id } = useParams();
  const { t } = useTranslation();
  const isSmallScreen = useIsTabletOrSmaller();
  const { toParty, fromParty, actingParty, isLoading: isPartyLoading } = usePartyRepresentation();

  const canGiveAccess = useCanGiveAccess(id ?? '', isReportee);
  const canRequestAccess = useCanRequestAccess(isReportee) && !canGiveAccess;

  const {
    data: delegatedResources,
    isError,
    isLoading,
  } = useGetSingleRightsForRightholderQuery(
    {
      actingParty: actingParty?.id || '',
      from: fromParty?.id || '',
      to: toParty?.id || '',
    },
    {
      skip: !actingParty || !fromParty || !toParty,
    },
  );

  const availableActions = getAvailableActions({ canGiveAccess, canRequestAccess });

  const modalRef = React.useRef<HTMLDialogElement>(null);
  const [selectedResource, setSelectedResource] = React.useState<ServiceResource | null>(null);
  const { actionError, setActionError } = useDelegationModalContext();

  // Rows in both lists open the same modal; ResourceInfo offers give/request/revoke as allowed.
  // `error` is set when a give/request from a row failed: actionError is then already set and is
  // shown in the modal.
  const openResource = (resource: ServiceResource, error = false) => {
    if (!error) {
      setActionError(null);
    }
    setSelectedResource(resource);
    modalRef.current?.showModal();
  };

  const requestFocusOnDataChange = useRestoreFocusOnDataChange(delegatedResources);
  const restoreFocusContext = useRestoreFocusContext();

  // Give (Users page) or request (PoA for others) buttons on the rows of the "other services"
  // list: the same controls as in the "Gi fullmakt" search.
  const { renderControls: renderOtherServiceControls, revokeConfirmationDialog: listRevokeDialog } =
    useSingleRightsListControls({
      delegatedResources,
      availableActions,
      onSelect: openResource,
      // A given service moves to the assigned list; focus its row there.
      onSuccess: (resource) => requestFocusOnDataChange(resource.identifier, 'single_rights_title'),
    });

  const { canRedelegateResource } = useCanRedelegateResource();
  const { confirmRevoke, revokeConfirmationDialog } = useRevokeConfirmation();

  const confirmDelete = (resource: ServiceResource, deleteResource: () => void) =>
    confirmRevoke(
      resource.identifier,
      () => canRedelegateResource(resource.identifier),
      deleteResource,
      {
        name: resource.title,
        toName: formatEntityDisplayName(toParty),
      },
    );

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

  return (
    toParty && (
      <div className={classes.singleRightsSectionContainer}>
        <div className={classes.headerContainer}>
          <DsHeading
            level={2}
            data-size='xs'
            id='single_rights_title'
          >
            {t('single_rights.current_services_title', {
              count: delegatedResources?.length ?? 0,
            })}
          </DsHeading>
          <HelpText aria-label={t('single_rights.helptext_button')}>
            {t('single_rights.helptext_content')}
          </HelpText>
        </div>
        {isError && <div>{t('user_rights_page.error')}</div>}
        {availableActions.includes(DelegationAction.REQUEST) && <PendingRequests />}
        <RestoreFocusFallback>
          <div className={classes.singleRightsList}>
            <ServiceSearchLists
              delegations={delegatedResources}
              size={isSmallScreen ? 'sm' : 'md'}
              // Same wording as the access package search on this page.
              getSearchHitsMessage={({ assigned, other }) =>
                `${t('access_packages.search_hits_active', { count: assigned })}. ${t('access_packages.search_other_hits', { count: other })}`
              }
              toolbarAction={
                (availableActions.includes(DelegationAction.DELEGATE) ||
                  availableActions.includes(DelegationAction.REQUEST)) && (
                  <SingleRightsDelegationModal availableActions={availableActions} />
                )
              }
              assignedList={{
                heading: t('access_packages.search_active_matches'),
                onSelect: (resource) => openResource(resource),
                noResourcesText: t('resource_list.no_user_resources'),
                renderControls: (resource) => {
                  if (isSmallScreen || !availableActions.includes(DelegationAction.REVOKE))
                    return null;
                  const isInherited = isResourceInherited(resource.identifier);
                  return (
                    <DeleteResourceButton
                      resource={resource}
                      disabled={isInherited}
                      confirmDelete={confirmDelete}
                      onSuccess={() =>
                        requestFocusOnDataChange(resource.identifier, 'single_rights_title')
                      }
                    />
                  );
                },
              }}
              otherList={{
                heading: t('access_packages.search_other_matches'),
                onSelect: (resource) => openResource(resource),
                renderControls: renderOtherServiceControls,
              }}
            />
          </div>
        </RestoreFocusFallback>
        {revokeConfirmationDialog}
        {listRevokeDialog}
        <EditModal
          ref={modalRef}
          ariaLabel={t('delegation_modal.aria_label.single_rights')}
          onClose={() => {
            // Request focus synchronously before clearing state.
            // If the resource was revoked inside the modal its row is gone, so fall back to
            // the section heading instead of dropping to <body>.
            if (selectedResource) {
              restoreFocusContext?.requestFocus(selectedResource.identifier, 'single_rights_title');
            }
            setSelectedResource(null);
          }}
        >
          {selectedResource && (
            <ResourceInfo
              resource={selectedResource}
              availableActions={availableActions}
              actionError={actionError}
            />
          )}
        </EditModal>
      </div>
    )
  );
};

export const SingleRightsSection = ({ isReportee = false }: { isReportee?: boolean }) => {
  const restoreFocus = useRestoreFocus();
  return (
    <RestoreFocusProvider restoreFocus={restoreFocus}>
      <SingleRightsSectionContent isReportee={isReportee} />
    </RestoreFocusProvider>
  );
};
