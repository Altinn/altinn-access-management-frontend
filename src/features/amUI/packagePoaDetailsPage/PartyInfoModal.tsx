import { forwardRef } from 'react';
import { DsDialog, Snackbar, SnackbarProvider } from '@altinn/altinn-components';

import classes from '../common/DelegationModal/DelegationModal.module.css';
import { PartyInfo, type PartyInfoProps } from '../common/DelegationModal/Party/PartyInfo';

interface PartyInfoModalProps {
  partyInfo?: PartyInfoProps;
  onClose?: () => void;
}

export const PartyInfoModal = forwardRef<HTMLDialogElement, PartyInfoModalProps>(
  ({ partyInfo, onClose }, ref) => {
    return (
      <DsDialog
        ref={ref}
        className={classes.modalDialog}
        closedby='any'
        onClose={onClose}
      >
        <SnackbarProvider>
          <div className={classes.content}>{partyInfo && <PartyInfo {...partyInfo} />}</div>
          <Snackbar />
        </SnackbarProvider>
      </DsDialog>
    );
  },
);

PartyInfoModal.displayName = 'PartyInfoModal';
