import type { JSX } from 'react';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ButtonProps, DsPopoverProps } from '@altinn/altinn-components';
import { Button, DsPopover, DsParagraph } from '@altinn/altinn-components';

import classes from './ButtonWithConfirmPopup.module.css';

interface ButtonWithConfirmPopupProps extends Omit<DsPopoverProps, 'children'> {
  onConfirm: () => void;
  message: string;
  confirmButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  triggerButtonProps?: ButtonProps;
  popoverProps?: DsPopoverProps;
  confirmButtonContent?: JSX.Element | string;
  cancelButtonContent?: JSX.Element | string;
  triggerButtonContent?: JSX.Element | string;
}

export const ButtonWithConfirmPopup = ({
  onConfirm,
  message,
  confirmButtonProps,
  cancelButtonProps,
  popoverProps,
  confirmButtonContent,
  cancelButtonContent,
  triggerButtonContent,
  triggerButtonProps,
}: ButtonWithConfirmPopupProps) => {
  const { t } = useTranslation();
  const id = useRef(Math.random().toString(36).substring(7));
  const [open, setOpen] = useState(false);

  return (
    <DsPopover.TriggerContext>
      <DsPopover.Trigger
        asChild={true}
        onClick={() => setOpen(true)}
      >
        <Button {...triggerButtonProps}>{triggerButtonContent}</Button>
      </DsPopover.Trigger>
      <DsPopover
        onClose={() => setOpen(false)}
        open={open}
        id={id.current}
        className={classes.popover}
        data-color='neutral'
        {...popoverProps}
      >
        <DsParagraph className={classes.confirmPopupMessage}>{message}</DsParagraph>
        <div className={classes.confirmPopupButtons}>
          <Button
            variant='outline'
            onClick={() => setOpen(false)}
            {...cancelButtonProps}
          >
            {cancelButtonContent || t('common.cancel')}
          </Button>
          <Button
            {...confirmButtonProps}
            onClick={() => {
              onConfirm();
            }}
          >
            {confirmButtonContent || t('common.confirm')}
          </Button>
        </div>
      </DsPopover>
    </DsPopover.TriggerContext>
  );
};
