import type { ButtonProps } from '@altinn/altinn-components';
import { Button, DsDialog, DsHeading, DsParagraph } from '@altinn/altinn-components';
import { t } from 'i18next';
import { Trans } from 'react-i18next';
import { useState } from 'react';

import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';

import classes from './PackageIsPartiallyDeletableAlert.module.css';

interface PackageIsPartiallyDeletableAlertProps {
  confirmAction: () => void;
  triggerButtonProps: ButtonProps;
}

export const PackageIsPartiallyDeletableAlert = ({
  confirmAction,
  triggerButtonProps,
}: PackageIsPartiallyDeletableAlertProps) => {
  const { toParty } = usePartyRepresentation();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        {...triggerButtonProps}
        onClick={() => setOpen(!open)}
      >
        {t('common.delete_poa')}
      </Button>
      <DsDialog
        open={open}
        closedby='any'
        closeButton={t('common.close')}
        onClose={() => setOpen(false)}
      >
        <div className={classes.modalContent}>
          <DsHeading>{t('delegation_modal.partial_deletion_message.heading')}</DsHeading>
          <div>
            <Trans
              i18nKey={'delegation_modal.partial_deletion_message.body'}
              values={{
                to_name: toParty?.name,
              }}
              components={{
                p: <DsParagraph data-size='sm'></DsParagraph>,
              }}
            />
          </div>
          <div className={classes.buttons}>
            <Button
              color='danger'
              onClick={confirmAction}
            >
              {t('common.delete')}
            </Button>
            <Button
              color='neutral'
              variant='text'
              onClick={() => setOpen(false)}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </DsDialog>
    </>
  );
};
