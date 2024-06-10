import { Button, Popover, Paragraph } from '@digdir/designsystemet-react';
import { t } from 'i18next';
import React, { HTMLAttributes, useState } from 'react';

import { useMediaQuery } from '@/resources/hooks';

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
}

export const NavigationSection = ({
  nextButtonProps,
  cancelButtonProps,
  ...props
}: NavigationSectionProps) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const isSm = useMediaQuery('(max-width: 768px)');
  return (
    <div {...props}>
      <Button
        variant='primary'
        color='first'
        fullWidth={isSm}
        disabled={nextButtonProps.disabled}
        onClick={nextButtonProps.onNext}
      >
        {t('common.proceed')}
      </Button>
      <Popover
        variant={'warning'}
        placement='top'
        open={popoverOpen}
        onClose={() => setPopoverOpen(false)}
      >
        <Popover.Trigger
          variant='tertiary'
          color={cancelButtonProps.showWarning ? 'danger' : 'first'}
          size='medium'
          onClick={
            cancelButtonProps.showWarning
              ? () => setPopoverOpen(!popoverOpen)
              : cancelButtonProps.onCancel
          }
        >
          {t('common.cancel')}
        </Popover.Trigger>
        <Popover.Content>
          <Paragraph>{t('single_rights.cancel_popover_text')}</Paragraph>
          <div className={classes.NavigationSection}>
            <Button
              onClick={cancelButtonProps.onCancel}
              color={'danger'}
              variant={'primary'}
              fullWidth
            >
              {t('common.yes')}
            </Button>
            <Button
              onClick={() => setPopoverOpen(false)}
              color={'danger'}
              variant={'tertiary'}
            >
              {t('single_rights.no_continue_delegating')}
            </Button>
          </div>
        </Popover.Content>
      </Popover>
    </div>
  );
};
