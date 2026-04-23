import { useEffect, useRef, useState } from 'react';
import type { ChipRight } from './rightsUtils';

type DelegationActions = {
  delegate: (actionKeys: string[], onSuccess: () => void, onError: () => void) => void;
  update: (actionKeys: string[], onSuccess: () => void, onError: () => void) => void;
  revoke: (onSuccess: () => void, onError: () => void) => void;
};

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
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const hasUnsavedChanges = rights.some((r) => r.checked !== r.delegated);
  const undelegableActions = rights.filter((r) => !r.delegable).map((r) => r.rightName);

  const beginAction = () => {
    setIsActionLoading(true);
    setIsActionSuccess(false);
    setDelegationError(null);
  };

  const handleSuccess = () => {
    setIsActionLoading(false);
    setIsActionSuccess(true);
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
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
