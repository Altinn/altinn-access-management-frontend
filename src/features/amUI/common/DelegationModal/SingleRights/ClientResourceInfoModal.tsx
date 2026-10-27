import { forwardRef } from 'react';
import { DsDialog } from '@altinn/altinn-components';

import type { ServiceResource } from '@/rtk/features/singleRights/singleRightsApi';

import dialogClasses from '../DelegationModal.module.css';
import { useClientAction, type ClientAction } from '../useClientAction';

import { ClientResourceInfo } from './ClientResourceInfo';

export interface ClientResourceModalData {
  resource: ServiceResource;
  userHasAccess: boolean;
  toPartyName?: string;
  onDelegate?: ClientAction;
  onRevoke?: ClientAction;
}

interface ClientResourceInfoModalProps {
  data?: ClientResourceModalData;
  onClose?: () => void;
}

export const ClientResourceInfoModal = forwardRef<HTMLDialogElement, ClientResourceInfoModalProps>(
  ({ data, onClose }, ref) => {
    const { isLoading, isSuccess, error, reset, bindAction } = useClientAction();

    const handleClose = () => {
      reset();
      onClose?.();
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
              error={error}
              onDelegate={bindAction(data.onDelegate)}
              onRevoke={bindAction(data.onRevoke)}
            />
          )}
        </div>
      </DsDialog>
    );
  },
);

ClientResourceInfoModal.displayName = 'ClientResourceInfoModal';
