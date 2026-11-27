import { forwardRef } from 'react';
import { DsDialog } from '@altinn/altinn-components';

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
        <div className={classes.content}>{partyInfo && <PartyInfo {...partyInfo} />}</div>
      </DsDialog>
    );
  },
);

PartyInfoModal.displayName = 'PartyInfoModal';
