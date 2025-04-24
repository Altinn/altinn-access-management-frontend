import { t } from 'i18next';
import type { HTMLAttributes } from 'react';
import React, { useState } from 'react';
import cn from 'classnames';
import { DsButton, DsPopover, DsParagraph } from '@altinn/altinn-components';

import classes from './NavigationSection.module.css';

interface NextButtonProps {
  onNext: () => void;
  disabled: boolean;
}

interface CancelButtonProps {
  onCancel: () => void;
  showWarning?: boolean;
}

interface NavigationSectionProps extends HTMLAttributes<HTMLDivElement> {
  nextButtonProps: NextButtonProps;
  cancelButtonProps: CancelButtonProps;
  className?: string;
}

export const NavigationSection = ({
  nextButtonProps,
  cancelButtonProps,
  className,
  ...props
}: NavigationSectionProps) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  return (
    <div
      className={cn([classes.navigationSectionContainer, className])}
      {...props}
    >
      <DsButton
        variant='primary'
        data-color='accent'
        disabled={nextButtonProps.disabled}
        onClick={nextButtonProps.onNext}
      >
        {t('common.proceed')}
      </DsButton>
      <DsPopover.TriggerContext>
        <DsPopover.Trigger
          variant='tertiary'
          color={cancelButtonProps.showWarning ? 'danger' : 'accent'}
          data-size='md'
          onClick={
            cancelButtonProps.showWarning
              ? () => setPopoverOpen(!popoverOpen)
              : cancelButtonProps.onCancel
          }
        >
          {t('common.cancel')}
        </DsPopover.Trigger>
        <DsPopover
          placement='top'
          open={popoverOpen}
          data-color='danger'
          onClose={() => setPopoverOpen(false)}
        >
          <DsParagraph>{t('single_rights.cancel_popover_text')}</DsParagraph>
          <div className={classes.NavigationSection}>
            <DsButton
              onClick={cancelButtonProps.onCancel}
              color={'danger'}
              variant={'primary'}
            >
              {t('common.yes')}
            </DsButton>
            <DsButton
              onClick={() => setPopoverOpen(false)}
              color={'danger'}
              variant={'tertiary'}
            >
              {t('single_rights.no_stay_here')}
            </DsButton>
          </div>
        </DsPopover>
      </DsPopover.TriggerContext>
    </div>
  );
};
