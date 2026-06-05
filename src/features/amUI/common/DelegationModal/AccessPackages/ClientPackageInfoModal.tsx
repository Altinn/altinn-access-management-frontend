import { forwardRef, useState } from 'react';
import { DsDialog } from '@altinn/altinn-components';

import type { AccessPackage } from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookupApi';

import type { InheritedStatusMessageType } from '../../useInheritedStatus';
import dialogClasses from '../DelegationModal.module.css';

import { ClientPackageInfo } from './ClientPackageInfo';

const animationDuration = 2000;

export interface ClientPackageModalData {
  party: Party;
  accessPackage: AccessPackage;
  userHasAccess: boolean;
  inheritedStatus?: InheritedStatusMessageType[];
  roleDescription?: string;
  onDelegate?: (onSuccess?: () => void, onError?: () => void) => void | Promise<void>;
  onRevoke: (onSuccess?: () => void, onError?: () => void) => void | Promise<void>;
}

interface ClientPackageInfoModalProps {
  data?: ClientPackageModalData;
  onClose?: () => void;
}

export const ClientPackageInfoModal = forwardRef<HTMLDialogElement, ClientPackageInfoModalProps>(
  ({ data, onClose }, ref) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleError = () => {
      setIsLoading(false);
      setIsSuccess(false);
    };

    const handleClose = () => {
      setIsLoading(false);
      setIsSuccess(false);
      onClose?.();
    };

    const runAction = async (
      action: (onSuccess?: () => void, onError?: () => void) => void | Promise<void>,
    ) => {
      setIsLoading(true);
      setIsSuccess(false);
      let actionHandled = false;

      const handleSuccess = () => {
        actionHandled = true;
        setIsLoading(false);
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), animationDuration);
      };

      const handleActionError = () => {
        actionHandled = true;
        handleError();
      };

      try {
        await action(handleSuccess, handleActionError);

        if (!actionHandled) {
          handleSuccess();
        }
      } catch {
        handleActionError();
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
              inheritedStatus={data.inheritedStatus}
              roleDescription={data.roleDescription}
              isLoading={isLoading}
              isSuccess={isSuccess}
              onDelegate={data.onDelegate ? () => runAction(data.onDelegate!) : undefined}
              onRevoke={() => runAction(data.onRevoke)}
            />
          )}
        </div>
      </DsDialog>
    );
  },
);

ClientPackageInfoModal.displayName = 'ClientPackageInfoModal';
