import * as React from 'react';

import { StatusMessageForScreenReader } from '@/components/StatusMessageForScreenReader/StatusMessageForScreenReader';

import { LoadingAnimation } from '../../LoadingAnimation/LoadingAnimation';
import { focusFirstEnabledButton, useRestoreFocusAfterSettled } from '../../RestoreFocus';
import { ResourceAlert, type ResourceAlertProps } from '../SingleRights/ResourceAlert';
import { ResourceInfoSkeleton } from '../SingleRights/ResourceInfoSkeleton';
import { DelegationPanelSection } from './DelegationPanelSection';

import classes from './DelegationPanel.module.css';

export interface DelegationRightsPanelProps {
  /** Rendered above the loading-gated body — a ResourceHeading, an InstanceDescription, etc. */
  header: React.ReactNode;
  /** Announced assertively whenever it changes. */
  screenReaderMessage?: string;
  /** Status and description content, rendered above the rights section once loading has settled. */
  body?: React.ReactNode;
  /** A delegate/update/revoke mutation is in flight — swaps the body for the loading animation. */
  isActionLoading: boolean;
  isActionSuccess: boolean;
  /** Rights data is loading — shows the skeleton. */
  isLoading: boolean;
  /** A button-level action that keeps the body in place (e.g. creating a single right request). */
  isSecondaryActionLoading?: boolean;
  /** When set, replaces the rights section. */
  alert?: Omit<ResourceAlertProps, 'className'> | null;
  rights: React.ReactNode;
  actions?: React.ReactNode;
}

/**
 * The shell every rights-delegation panel shares: screen reader status, header, the
 * loading/success/skeleton gate, an alert that stands in for the rights section, and the action
 * button row — including returning focus to it once an action settles.
 */
export const DelegationRightsPanel = ({
  header,
  screenReaderMessage,
  body,
  isActionLoading,
  isActionSuccess,
  isLoading,
  isSecondaryActionLoading = false,
  alert,
  rights,
  actions,
}: DelegationRightsPanelProps) => {
  // Delegate/update/revoke swap the action buttons for a loading then success animation in place,
  // dropping focus to the dialog body. Once it settles, return focus to whichever button remains.
  const actionsRef = React.useRef<HTMLDivElement>(null);
  useRestoreFocusAfterSettled({
    isSettled: !isActionLoading && !isActionSuccess && !isLoading && !isSecondaryActionLoading,
    requestWhen: isActionLoading || isSecondaryActionLoading,
    onRestore: () => focusFirstEnabledButton(actionsRef.current),
  });

  return (
    <>
      <StatusMessageForScreenReader politenessSetting='assertive'>
        {screenReaderMessage ?? ''}
      </StatusMessageForScreenReader>
      <div>
        {header}
        {isActionLoading || isActionSuccess ? (
          <LoadingAnimation
            isLoading={isActionLoading}
            displaySuccess={isActionSuccess}
          />
        ) : isLoading ? (
          <ResourceInfoSkeleton />
        ) : (
          <>
            {body && <DelegationPanelSection>{body}</DelegationPanelSection>}
            {alert ? (
              <ResourceAlert
                {...alert}
                className={classes.resourceAlert}
              />
            ) : (
              rights
            )}
            <div
              ref={actionsRef}
              className={classes.editButtons}
            >
              {actions}
            </div>
          </>
        )}
      </div>
    </>
  );
};
