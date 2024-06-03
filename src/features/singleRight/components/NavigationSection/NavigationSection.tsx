import { Button, Popover, Paragraph } from '@digdir/designsystemet-react';
import { t } from 'i18next';
import React, { useState } from 'react';

import { GroupElements } from '@/components';
import { useMediaQuery } from '@/resources/hooks';

import classes from './NavigationSection.module.css';

interface NavigationSectionProps {
  delegableChosenServices: any[];
  onCancel: () => void;
}

export const NavigationSection = ({
  delegableChosenServices,
  onCancel,
}: NavigationSectionProps) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const isSm = useMediaQuery('(max-width: 768px)');
  return (
    <div className={classes.NavigationSection}>
      <Button
        variant='primary'
        color='first'
        fullWidth={isSm}
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
          color={delegableChosenServices.length > 0 ? 'danger' : 'first'}
          size='medium'
          onClick={
            delegableChosenServices.length > 0 ? () => setPopoverOpen(!popoverOpen) : onCancel
          }
        >
          {t('common.cancel')}
        </Popover.Trigger>
        <Popover.Content>
          <Paragraph>{t('single_rights.cancel_popover_text')}</Paragraph>
          <GroupElements>
            <Button
              onClick={onCancel}
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
          </GroupElements>
        </Popover.Content>
      </Popover>
    </div>
  );
};
