import React, { useState } from 'react';
import { DsButton, DsDialog } from '@altinn/altinn-components';
import { useTranslation } from 'react-i18next';
import { type EnrichedPackageRequest } from '@/rtk/features/requestApi';
import { PendingPackageRequestsList } from './RequestsList';
import {
  RestoreFocusFallback,
  RestoreFocusProvider,
  useRestoreFocus,
} from '../../../common/RestoreFocus';
import classes from './Requests.module.css';

interface PendingPackageRequestsModalProps {
  modalRef: React.RefObject<HTMLDialogElement | null>;
  isModalOpen: boolean;
  heading: string;
  onClose: () => void;
}

export const PendingPackageRequestsModal = ({
  modalRef,
  isModalOpen,
  heading,
  onClose,
}: PendingPackageRequestsModalProps) => {
  const { t } = useTranslation();
  const [selectedRequest, setSelectedRequest] = useState<EnrichedPackageRequest | null>(null);
  const restoreFocus = useRestoreFocus();

  return (
    <DsDialog
      ref={modalRef}
      closedby='any'
      onClose={() => {
        setSelectedRequest(null);
        onClose();
      }}
      className={classes.dialog}
    >
      <RestoreFocusProvider restoreFocus={restoreFocus}>
        <RestoreFocusFallback>
          {isModalOpen && (
            <PendingPackageRequestsList
              heading={heading}
              selectedRequest={selectedRequest}
              setSelectedRequest={setSelectedRequest}
            />
          )}
        </RestoreFocusFallback>
      </RestoreFocusProvider>

      {!selectedRequest && (
        <DsButton
          variant='primary'
          className={classes.closeButton}
          onClick={() => modalRef.current?.close()}
        >
          {t('common.close')}
        </DsButton>
      )}
    </DsDialog>
  );
};
