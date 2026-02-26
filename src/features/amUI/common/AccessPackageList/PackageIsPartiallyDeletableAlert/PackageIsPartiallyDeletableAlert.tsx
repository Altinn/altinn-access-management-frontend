import type { DsButtonProps } from '@altinn/altinn-components';
import {
  DsButton,
  DsDialog,
  DsHeading,
  DsParagraph,
  formatDisplayName,
} from '@altinn/altinn-components';
import { t } from 'i18next';
import { Trans } from 'react-i18next';
import { useState } from 'react';

import { usePartyRepresentation } from '../../PartyRepresentationContext/PartyRepresentationContext';

import classes from './PackageIsPartiallyDeletableAlert.module.css';
import { PartyType } from '@/rtk/features/userInfoApi';

interface PackageIsPartiallyDeletableAlertProps {
  confirmAction: () => void;
  triggerButtonProps: DsButtonProps;
}

export const PackageIsPartiallyDeletableAlert = ({
  confirmAction,
  triggerButtonProps,
}: PackageIsPartiallyDeletableAlertProps) => {
  const { toParty } = usePartyRepresentation();
  const [open, setOpen] = useState(false);
  return (
    <>
      <DsButton
        {...triggerButtonProps}
        onClick={() => setOpen(!open)}
      >
        {t('common.delete_poa')}
      </DsButton>
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
                to_name: formatDisplayName({
                  fullName: toParty?.name || '',
                  type: toParty?.partyTypeName === PartyType.Person ? 'person' : 'company',
                }),
              }}
              components={{
                p: <DsParagraph data-size='sm'></DsParagraph>,
              }}
            />
          </div>
          <div className={classes.buttons}>
            <DsButton
              data-color='danger'
              onClick={confirmAction}
            >
              {t('common.delete')}
            </DsButton>
            <DsButton
              data-color='neutral'
              variant='tertiary'
              onClick={() => setOpen(false)}
            >
              {t('common.cancel')}
            </DsButton>
          </div>
        </div>
      </DsDialog>
    </>
  );
};
