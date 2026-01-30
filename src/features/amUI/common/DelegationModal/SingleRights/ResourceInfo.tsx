import * as React from 'react';
import { DsParagraph } from '@altinn/altinn-components';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { StatusMessageForScreenReader } from '@/components/StatusMessageForScreenReader/StatusMessageForScreenReader';

import { StatusSection } from '../../StatusSection/StatusSection';
import { useRightsSection } from './hooks/useRightsSection';
import { LoadingAnimation } from '../../LoadingAnimation/LoadingAnimation';
import { ResourceHeading } from './ResourceHeading';
import { RightsSection } from './RightsSection';

import classes from './ResourceInfo.module.css';

export interface ResourceInfoProps {
  resource: ServiceResource;
  onDelegate?: () => void;
}

export const ResourceInfo = ({ resource, onDelegate }: ResourceInfoProps) => {
  const {
    chips,
    saveEditedRights,
    delegateChosenRights,
    undelegableActions,
    rights,
    hasUnsavedChanges,
    hasAccess,
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

  return (
    <>
      <StatusMessageForScreenReader politenessSetting='assertive'>
        {delegationError ?? missingAccess ?? ''}
      </StatusMessageForScreenReader>
      {!!resource && (
        <div className={classes.infoView}>
          <ResourceHeading resource={resource} />
          <StatusSection
            userHasAccess={hasAccess}
            showDelegationCheckWarning={showMissingRightsStatus}
            cannotDelegateHere={cannotDelegateHere}
          />
          {resource.description && <DsParagraph>{resource.description}</DsParagraph>}
          {resource.rightDescription && <DsParagraph>{resource.rightDescription}</DsParagraph>}
          {isActionLoading || isActionSuccess ? (
            <LoadingAnimation
              isLoading={isActionLoading}
              displaySuccess={isActionSuccess}
            />
          ) : (
            <RightsSection
              resource={resource}
              chips={chips}
              saveEditedRights={saveEditedRights}
              delegateChosenRights={delegateChosenRights}
              undelegableActions={undelegableActions}
              rights={rights}
              hasUnsavedChanges={hasUnsavedChanges}
              hasAccess={hasAccess}
              isDelegationCheckError={isDelegationCheckError}
              delegationCheckError={delegationCheckError}
              delegationError={delegationError}
              missingAccess={missingAccess}
            />
          )}
        </div>
      )}
    </>
  );
};
