import { forwardRef } from 'react';
import { DsDialog } from '@altinn/altinn-components';

import type { PartyEntity } from '@/dataObjects/dtos/Party';
import type { AccessPackage } from '@/rtk/features/accessPackageApi';

import dialogClasses from '../DelegationModal.module.css';
import { useClientAction, type ClientAction } from '../useClientAction';

import { ClientPackageInfo } from './ClientPackageInfo';

export interface ClientPackageModalData {
  party: PartyEntity;
  accessPackage: AccessPackage;
  userHasAccess: boolean;
  roleDescription?: string;
  onDelegate?: ClientAction;
  onRevoke?: ClientAction;
}

interface ClientPackageInfoModalProps {
  data?: ClientPackageModalData;
  onClose?: () => void;
}

export const ClientPackageInfoModal = forwardRef<HTMLDialogElement, ClientPackageInfoModalProps>(
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
            <ClientPackageInfo
              party={data.party}
              accessPackage={data.accessPackage}
              userHasAccess={data.userHasAccess}
              roleDescription={data.roleDescription}
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

ClientPackageInfoModal.displayName = 'ClientPackageInfoModal';
