import * as React from 'react';
import { DsParagraph } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { StatusMessageForScreenReader } from '@/components/StatusMessageForScreenReader/StatusMessageForScreenReader';
import { useIsMobileOrSmaller } from '@/resources/utils/screensizeUtils';

import { StatusSection } from '../../StatusSection/StatusSection';
import { LoadingAnimation } from '../../LoadingAnimation/LoadingAnimation';
import { ResourceHeading } from '../SingleRights/ResourceHeading';
import { RightsSection } from '../SingleRights/RightsSection';
import { ResourceInfoSkeleton } from '../SingleRights/ResourceInfoSkeleton';
import { DelegationAction } from '../EditModal';
import { useInstanceRightsSection } from './useInstanceRightsSection';

import classes from '../SingleRights/ResourceInfo.module.css';

export interface InstanceInfoProps {
  resource: ServiceResource;
  instanceUrn: string;
  instanceName?: string;
  toPartyUuid?: string;
  toPartyName?: string;
  availableActions?: DelegationAction[];
  onDelegate?: () => void;
}

export const InstanceInfo = ({
  resource,
  instanceUrn,
  instanceName,
  toPartyUuid,
  toPartyName,
  availableActions,
  onDelegate,
}: InstanceInfoProps) => {
  const { t } = useTranslation();
  const isSmall = useIsMobileOrSmaller();

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
    isLoading,
    isActionLoading,
    isActionSuccess,
    rightsMetaTechnicalErrorDetails,
  } = useInstanceRightsSection({ resource, instanceUrn, toPartyUuid, onDelegate });

  const hasDelegableRights = rights.some((r) => r.delegable);
  const showMissingRightsStatus = !hasAccess && rights.length > 0 && !hasDelegableRights;
  const cannotDelegateHere = resource?.delegable === false;
  const shortId = instanceUrn.slice(-10);

  return (
    <>
      <StatusMessageForScreenReader politenessSetting='assertive'>
        {delegationError ?? missingAccess ?? ''}
      </StatusMessageForScreenReader>
      <div>
        <ResourceHeading resource={resource} />
        {isActionLoading || isActionSuccess ? (
          <LoadingAnimation
            isLoading={isActionLoading}
            displaySuccess={isActionSuccess}
          />
        ) : isLoading ? (
          <ResourceInfoSkeleton />
        ) : (
          <>
            <div
              className={classes.resourceInfo}
              data-size={isSmall ? 'xs' : 'md'}
            >
              <DsParagraph data-size='sm'>
                {instanceName
                  ? `${instanceName} (${shortId})`
                  : `${t('instance_detail_page.instance_id')}: ${shortId}`}
              </DsParagraph>
              <StatusSection
                userHasAccess={hasAccess}
                showDelegationCheckWarning={showMissingRightsStatus}
                cannotDelegateHere={cannotDelegateHere}
              />
              {resource.description && <DsParagraph>{resource.description}</DsParagraph>}
            </div>
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
              delegationError={delegationError ?? null}
              missingAccess={missingAccess}
              rightsMetaTechnicalErrorDetails={rightsMetaTechnicalErrorDetails}
              toPartyName={toPartyName}
            />
          </>
        )}
      </div>
    </>
  );
};
