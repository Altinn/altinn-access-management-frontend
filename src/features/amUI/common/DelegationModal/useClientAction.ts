import { useState } from 'react';

import { getActionError, type ActionError } from '@/resources/hooks/useActionError';

const animationDuration = 2000;

export type ClientAction = (
  onSuccess?: () => void,
  onError?: (error?: ActionError) => void,
) => void | Promise<void>;

/** Loading, success and error state for a delegate/revoke action run from a client info modal. */
export const useClientAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<ActionError | null>(null);

  const reset = () => {
    setIsLoading(false);
    setIsSuccess(false);
    setError(null);
  };

  const runAction = async (action: ClientAction) => {
    setIsLoading(true);
    setIsSuccess(false);
    setError(null);
    let actionHandled = false;

    const handleSuccess = () => {
      actionHandled = true;
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), animationDuration);
    };

    const handleActionError = (actionError?: ActionError) => {
      actionHandled = true;
      setIsLoading(false);
      setIsSuccess(false);
      setError(actionError ?? null);
    };

    try {
      await action(handleSuccess, handleActionError);

      if (!actionHandled) {
        handleSuccess();
      }
    } catch (thrown) {
      handleActionError(getActionError(thrown));
    }
  };

  /** Wraps an optional action as a click handler, or returns undefined so the button is hidden. */
  const bindAction = (action?: ClientAction) => (action ? () => void runAction(action) : undefined);

  return { isLoading, isSuccess, error, reset, bindAction };
};
