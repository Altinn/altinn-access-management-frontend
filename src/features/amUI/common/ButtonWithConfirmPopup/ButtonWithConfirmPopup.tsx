import type { PopoverProps } from '@digdir/designsystemet-react';
import { Paragraph, Popover } from '@digdir/designsystemet-react';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ButtonProps } from '@altinn/altinn-components';
import { Button } from '@altinn/altinn-components';

import classes from './ButtonWithConfirmPopup.module.css';

interface ButtonWithConfirmPopupProps extends Omit<PopoverProps, 'children'> {
  onConfirm: () => void;
  message: string;
  confirmButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  triggerButtonProps?: ButtonProps;
  popoverProps?: PopoverProps;
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
    <Popover.TriggerContext>
      <Popover.Trigger
        {...triggerButtonProps}
        onClick={() => setOpen(!open)}
      >
        {triggerButtonContent}
      </Popover.Trigger>
      <Popover
        open={open}
        id={id.current}
        className={classes.popover}
        {...popoverProps}
      >
        <Paragraph className={classes.confirmPopupMessage}>{message}</Paragraph>
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
      </Popover>
    </Popover.TriggerContext>
  );
};
