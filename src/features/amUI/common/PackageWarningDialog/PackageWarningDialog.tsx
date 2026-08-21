import { useId } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  DsButton,
  DsDialog,
  DsHeading,
  DsParagraph,
  formatDisplayName,
} from '@altinn/altinn-components';

import type { Party } from '@/rtk/features/lookupApi';
import { PartyType } from '@/rtk/features/userInfoApi';

import type { PendingPackageAction } from './packageWarning';
import classes from './PackageWarningDialog.module.css';

interface PackageWarningDialogProps {
  pending: PendingPackageAction | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const displayName = (party: Party) =>
  formatDisplayName({
    fullName: party.name,
    type: party.partyTypeName === PartyType.Person ? 'person' : 'company',
  });

export const PackageWarningDialog = ({
  pending,
  onConfirm,
  onCancel,
}: PackageWarningDialogProps) => {
  const { t } = useTranslation();
  const headingId = useId();

  return (
    <DsDialog.TriggerContext>
      <DsDialog
        open={!!pending}
        closedby='any'
        closeButton={t('common.close')}
        onClose={onCancel}
        aria-labelledby={headingId}
      >
        {pending && (
          <div className={classes.content}>
            <DsHeading
              id={headingId}
              level={2}
              data-size='xs'
            >
              {t('delegation_modal.package_warning.heading')}
            </DsHeading>
            <div className={classes.text}>
              <Trans
                i18nKey={`delegation_modal.package_warning.${pending.action}.${pending.warning}`}
                values={{
                  package_name: pending.accessPackage.name,
                  from_name: displayName(pending.fromParty),
                  to_name: displayName(pending.toParty),
                }}
                components={{ p: <DsParagraph data-size='sm' /> }}
              />
            </div>
            <div className={classes.buttons}>
              <DsButton onClick={onConfirm}>
                {t(`delegation_modal.package_warning.${pending.action}.confirm`)}
              </DsButton>
              <DsButton
                variant='secondary'
                onClick={onCancel}
              >
                {t('common.cancel')}
              </DsButton>
            </div>
          </div>
        )}
      </DsDialog>
    </DsDialog.TriggerContext>
  );
};
