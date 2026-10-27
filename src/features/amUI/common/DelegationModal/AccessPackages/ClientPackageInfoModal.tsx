import { forwardRef, useState } from 'react';
import { DsDialog } from '@altinn/altinn-components';

import type { PartyEntity } from '@/dataObjects/dtos/Party';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import { getActionError, type ActionError } from '@/resources/hooks/useActionError';

import dialogClasses from '../DelegationModal.module.css';

import { ClientPackageInfo } from './ClientPackageInfo';

const animationDuration = 2000;

export interface ClientPackageModalData {
  party: PartyEntity;
  accessPackage: AccessPackage;
  userHasAccess: boolean;
  roleDescription?: string;
  onDelegate?: (onSuccess?: () => void, onError?: () => void) => void | Promise<void>;
  onRevoke?: (onSuccess?: () => void, onError?: () => void) => void | Promise<void>;
}

interface ClientPackageInfoModalProps {
  data?: ClientPackageModalData;
  onClose?: () => void;
}

export const ClientPackageInfoModal = forwardRef<HTMLDialogElement, ClientPackageInfoModalProps>(
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
            <ClientPackageInfo
              party={data.party}
              accessPackage={data.accessPackage}
              userHasAccess={data.userHasAccess}
              roleDescription={data.roleDescription}
              isLoading={isLoading}
              isSuccess={isSuccess}
              error={actionError}
              onDelegate={
                data.onDelegate
                  ? () => {
                      if (data.onDelegate) void runAction(data.onDelegate);
                    }
                  : undefined
              }
              onRevoke={
                data.onRevoke
                  ? () => {
                      if (data.onRevoke) void runAction(data.onRevoke);
                    }
                  : undefined
              }
            />
          )}
        </div>
      </DsDialog>
    );
  },
);

ClientPackageInfoModal.displayName = 'ClientPackageInfoModal';
