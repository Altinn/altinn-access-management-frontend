import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DsButton, DsHeading, DsParagraph, DsPopover } from '@altinn/altinn-components';
import { InformationSquareIcon, XMarkIcon } from '@navikt/aksel-icons';

import classes from './AdministratorInfoPopover.module.css';

interface AdministratorInfoPopoverProps {
  /*** The text the info icon is placed right after */
  children: React.ReactNode;
}

/*** A text followed by an info icon that opens the description of the Konkursbo administrator authorization */
export const AdministratorInfoPopover = ({ children }: AdministratorInfoPopoverProps) => {
  const { t } = useTranslation();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const close = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <DsPopover.TriggerContext>
      <DsParagraph className={classes.text}>
        {children}{' '}
        <DsPopover.Trigger
          inline
          ref={triggerRef}
          className={classes.trigger}
          aria-label={t('bankruptcy_estate_administration_page.info_icon_label')}
        >
          <InformationSquareIcon
            aria-hidden='true'
            fontSize='1.25em'
          />
        </DsPopover.Trigger>
      </DsParagraph>
      <DsPopover
        open={isOpen}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        data-color='neutral'
        className={classes.popover}
      >
        <div className={classes.header}>
          <DsHeading
            level={2}
            data-size='2xs'
          >
            {t('bankruptcy_estate_administration_page.info_heading')}
          </DsHeading>
          <DsButton
            icon
            variant='tertiary'
            data-size='sm'
            aria-label={t('common.close')}
            onClick={close}
          >
            <XMarkIcon aria-hidden='true' />
          </DsButton>
        </div>
        <DsParagraph data-size='xs'>
          {t('bankruptcy_estate_administration_page.info_body')}
        </DsParagraph>
        <DsParagraph data-size='xs'>
          {t('bankruptcy_estate_administration_page.info_body_removal')}
        </DsParagraph>
      </DsPopover>
    </DsPopover.TriggerContext>
  );
};
