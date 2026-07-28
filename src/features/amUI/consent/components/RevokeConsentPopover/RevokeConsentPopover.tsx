import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EraserIcon } from '@navikt/aksel-icons';
import { DsButton, DsParagraph, DsPopover } from '@altinn/altinn-components';
import classes from './RevokeConsentPopover.module.css';

interface RevokeConsentPopoverProps {
  isRevoking: boolean;
  consentIsPoa: boolean;
  onRevokeConsent: () => void;
}

export const RevokeConsentPopover = ({
  isRevoking,
  consentIsPoa,
  onRevokeConsent,
}: RevokeConsentPopoverProps) => {
  const { t } = useTranslation();
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

  // restore focus to the trigger button when the popover is closed
  const closePopover = () => {
    setIsPopoverOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <DsPopover.TriggerContext>
      <DsPopover.Trigger
        variant='tertiary'
        ref={triggerRef}
        aria-disabled={isRevoking}
        loading={isRevoking}
        onClick={() => {
          if (!isRevoking) {
            setIsPopoverOpen(true);
          }
        }}
      >
        <EraserIcon aria-hidden='true' />
        {consentIsPoa ? t('active_consents.revoke_poa') : t('active_consents.revoke_consent')}
      </DsPopover.Trigger>
      <DsPopover
        open={isPopoverOpen}
        placement='bottom'
        className={classes.revokePopover}
        data-color='danger'
        onClose={closePopover}
      >
        <DsParagraph className={classes.popoverText}>
          {consentIsPoa
            ? t('active_consents.revoke_poa_text')
            : t('active_consents.revoke_consent_text')}
        </DsParagraph>
        <div className={classes.popoverButtonRow}>
          <DsButton
            data-color='danger'
            onClick={() => {
              onRevokeConsent();
              closePopover();
            }}
          >
            {consentIsPoa
              ? t('active_consents.confirm_revoke_poa')
              : t('active_consents.confirm_revoke_consent')}
          </DsButton>
          <DsButton
            variant='tertiary'
            onClick={closePopover}
          >
            {t('common.cancel')}
          </DsButton>
        </div>
      </DsPopover>
    </DsPopover.TriggerContext>
  );
};
