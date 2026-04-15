import { useEffect, useRef, useState } from 'react';

import type { ChipRight } from './rightsUtils';

// Callback-based actions so callers can use either RTK mutations (.unwrap())
// or the existing callback-style hooks without wrapping in promises.
type DelegationActions = {
  delegate: (actionKeys: string[], onSuccess: () => void, onError: () => void) => void;
  update: (actionKeys: string[], onSuccess: () => void, onError: () => void) => void;
  revoke: (onSuccess: () => void, onError: () => void) => void;
};

/**
 * Manages action state for rights delegation: loading, success, and error.
 * Provides delegateChosenRights, saveEditedRights, and revokeResource functions.
 *
 * Called from the component alongside a data hook (useSingleRightsDelegationRightsData
 * or useInstanceDelegationRightsData). The data hook provides `rights`; this hook
 * provides the actions and their state.
 *
 * The `actions` parameter decouples this hook from the specific API (single rights
 * vs. instance), making it reusable across both flows.
 */
export const useRightsSection = ({
  rights,
  actions,
  onDelegate,
}: {
  rights: ChipRight[];
  actions: DelegationActions;
  onDelegate?: () => void;
}) => {
  const [delegationError, setDelegationError] = useState<'delegate' | 'revoke' | 'edit' | null>(
    null,
  );
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isActionSuccess, setIsActionSuccess] = useState(false);

  // Keep a ref to the success timer so we can clear it on unmount
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  // Derived state from the current rights list
  const hasUnsavedChanges = rights.some((r) => r.checked !== r.delegated);
  const undelegableActions = rights.filter((r) => !r.delegable).map((r) => r.rightName);

  // Called before any action to reset previous results and show loading
  const beginAction = () => {
    setIsActionLoading(true);
    setIsActionSuccess(false);
    setDelegationError(null);
  };

  // Called when an action completes successfully
  const handleSuccess = () => {
    setIsActionLoading(false);
    setIsActionSuccess(true);
    successTimerRef.current = setTimeout(() => setIsActionSuccess(false), 2000);
    onDelegate?.();
  };

  const delegateChosenRights = () => {
    const actionKeys = rights.filter((r) => r.checked).map((r) => r.rightKey);
    beginAction();
    actions.delegate(actionKeys, handleSuccess, () => {
      setIsActionLoading(false);
      setDelegationError('delegate');
    });
  };

  const saveEditedRights = () => {
    const actionKeys = rights.filter((r) => r.checked).map((r) => r.rightKey);
    beginAction();
    actions.update(actionKeys, handleSuccess, () => {
      setIsActionLoading(false);
      setDelegationError('edit');
    });
  };

  const revokeResource = () => {
    beginAction();
    actions.revoke(handleSuccess, () => {
      setIsActionLoading(false);
      setDelegationError('revoke');
    });
  };

  return {
    delegateChosenRights,
    saveEditedRights,
    revokeResource,
    hasUnsavedChanges,
    undelegableActions,
    delegationError,
    isActionLoading,
    isActionSuccess,
  };
};
