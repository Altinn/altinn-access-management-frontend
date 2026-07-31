import { forwardRef, useState } from 'react';
import { DsDialog } from '@altinn/altinn-components';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';
import { getActionError, type ActionError } from '@/resources/hooks/useActionError';

import dialogClasses from '../DelegationModal.module.css';

import { ClientResourceInfo } from './ClientResourceInfo';

const animationDuration = 2000;

export interface ClientResourceModalData {
  resource: ServiceResource;
  userHasAccess: boolean;
  toPartyName?: string;
  onDelegate?: (
    onSuccess?: () => void,
    onError?: (error?: ActionError) => void,
  ) => void | Promise<void>;
  onRevoke?: (
    onSuccess?: () => void,
    onError?: (error?: ActionError) => void,
  ) => void | Promise<void>;
}

interface ClientResourceInfoModalProps {
  data?: ClientResourceModalData;
  onClose?: () => void;
}

export const ClientResourceInfoModal = forwardRef<HTMLDialogElement, ClientResourceInfoModalProps>(
  ({ data, onClose }, ref) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [actionError, setActionError] = useState<ActionError | null>(null);

    const handleClose = () => {
      setIsLoading(false);
      setIsSuccess(false);
      setActionError(null);
      onClose?.();
    };

    const runAction = async (
      action: (
        onSuccess?: () => void,
        onError?: (error?: ActionError) => void,
      ) => void | Promise<void>,
    ) => {
      setIsLoading(true);
      setIsSuccess(false);
      setActionError(null);
      let actionHandled = false;

      const handleSuccess = () => {
        actionHandled = true;
        setIsLoading(false);
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), animationDuration);
      };

      const handleActionError = (error?: ActionError) => {
        actionHandled = true;
        setIsLoading(false);
        setIsSuccess(false);
        setActionError(error ?? null);
      };

      try {
        await action(handleSuccess, handleActionError);

        if (!actionHandled) {
          handleSuccess();
        }
      } catch (error) {
        handleActionError(getActionError(error));
      }
    };

    return (
      <DsDialog
        ref={ref}
        className={dialogClasses.modalDialog}
        closedby='any'
        onClose={handleClose}
      >
        <div className={dialogClasses.content}>
          {data && (
            <ClientResourceInfo
              resource={data.resource}
              userHasAccess={data.userHasAccess}
              toPartyName={data.toPartyName}
              isLoading={isLoading}
              isSuccess={isSuccess}
              error={actionError}
              onDelegate={data.onDelegate ? () => runAction(data.onDelegate!) : undefined}
              onRevoke={data.onRevoke ? () => runAction(data.onRevoke!) : undefined}
            />
          )}
        </div>
      </DsDialog>
    );
  },
);

ClientResourceInfoModal.displayName = 'ClientResourceInfoModal';
