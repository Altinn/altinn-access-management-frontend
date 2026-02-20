import * as React from 'react';
import { DsParagraph } from '@altinn/altinn-components';

import {
  useGetSingleRightsForRightholderQuery,
  type ServiceResource,
} from '@/rtk/features/singleRights/singleRightsApi';
import { StatusMessageForScreenReader } from '@/components/StatusMessageForScreenReader/StatusMessageForScreenReader';

import { StatusSection } from '../../StatusSection/StatusSection';
import { useRightsSection } from './hooks/useRightsSection';
import { LoadingAnimation } from '../../LoadingAnimation/LoadingAnimation';
import { ResourceHeading } from './ResourceHeading';
import { RightsSection } from './RightsSection';

import classes from './ResourceInfo.module.css';
import {
  InheritedStatusMessageType,
  InheritedStatusType,
  useInheritedStatusInfo,
} from '../../useInheritedStatus';
import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';
import { DelegationAction } from '../EditModal';

export interface ResourceInfoProps {
  resource: ServiceResource;
  onDelegate?: () => void;
  availableActions?: DelegationAction[];
}

export const ResourceInfo = ({ resource, onDelegate, availableActions }: ResourceInfoProps) => {
  const { actingParty, fromParty, toParty } = usePartyRepresentation();
  const { data: resourceDelegations } = useGetSingleRightsForRightholderQuery(
    {
      actingParty: actingParty?.partyUuid || '',
      from: fromParty?.partyUuid || '',
      to: toParty?.partyUuid || '',
    },
    {
      skip: !actingParty || !fromParty || !toParty,
    },
  );
  const {
    chips,
    saveEditedRights,
    delegateChosenRights,
    revokeResource,
    undelegableActions,
    rights,
    hasUnsavedChanges,
    hasAccess,
    isDelegationCheckLoading,
    isDelegationCheckError,
    delegationCheckError,
    delegationError,
    missingAccess,
    isActionLoading,
    isActionSuccess,
  } = useRightsSection({ resource, onDelegate });

  const hasDelegableRights = rights.some((r) => r.delegable);
  const showMissingRightsStatus = !hasAccess && rights.length > 0 && !hasDelegableRights;
  const cannotDelegateHere = resource?.delegable === false;
  const resourcePermissions =
    resourceDelegations?.find(
      (delegation) => delegation.resource.identifier === resource.identifier,
    )?.permissions || [];

  const inheritedStatus = useInheritedStatusInfo({
    permissions: resourcePermissions,
    toParty,
    fromParty,
    actingParty,
  });

  return (
    <>
      <StatusMessageForScreenReader politenessSetting='assertive'>
        {delegationError ?? missingAccess ?? ''}
      </StatusMessageForScreenReader>
      {!!resource && (
        <div className={classes.infoView}>
          <ResourceHeading resource={resource} />
          {isActionLoading || isActionSuccess ? (
            <LoadingAnimation
              isLoading={isActionLoading}
              displaySuccess={isActionSuccess}
            />
          ) : (
            <>
              <StatusSection
                userHasAccess={hasAccess}
                showDelegationCheckWarning={showMissingRightsStatus}
                inheritedStatus={inheritedStatus}
                cannotDelegateHere={cannotDelegateHere}
              />
              {resource.description && <DsParagraph>{resource.description}</DsParagraph>}
              {resource.rightDescription && <DsParagraph>{resource.rightDescription}</DsParagraph>}

              <RightsSection
                resource={resource}
                chips={chips}
                saveEditedRights={saveEditedRights}
                delegateChosenRights={delegateChosenRights}
                revokeResource={revokeResource}
                availableActions={availableActions}
                undelegableActions={undelegableActions}
                rights={rights}
                hasUnsavedChanges={hasUnsavedChanges}
                hasAccess={hasAccess}
                isDelegationCheckLoading={isDelegationCheckLoading}
                isDelegationCheckError={isDelegationCheckError}
                delegationCheckError={delegationCheckError}
                delegationError={delegationError}
                missingAccess={missingAccess}
              />
            </>
          )}
        </div>
      )}
    </>
  );
};
