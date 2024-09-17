import type { ButtonProps, PopoverProps, PopoverTriggerProps } from '@digdir/designsystemet-react';
import { Popover, Button } from '@digdir/designsystemet-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import classes from './ButtonWithConfirmPopup.module.css';

interface ButtonWithConfirmPopupProps extends Omit<PopoverProps, 'children'> {
  onConfirm: () => void;
  message: string;
  confirmButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  triggerButtonProps?: PopoverTriggerProps;
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
  triggerButtonProps,
  popoverProps,
  confirmButtonContent,
  cancelButtonContent,
  triggerButtonContent,
  ...props
}: ButtonWithConfirmPopupProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Popover
        {...props}
        open={open}
        onClose={() => setOpen(false)}
      >
        <Popover.Trigger
          {...triggerButtonProps}
          onClick={() => setOpen(!open)}
        >
          {triggerButtonContent}
        </Popover.Trigger>
        <Popover.Content {...popoverProps}>
          <div className={classes.confirmPopupMessage}>{message}</div>
          <div className={classes.confirmPopupButtons}>
            <Button
              variant='secondary'
              {...cancelButtonProps}
              onClick={() => setOpen(false)}
            >
              {cancelButtonContent || t('common.cancel')}
            </Button>
            <Button
              {...confirmButtonProps}
              onClick={() => {
                onConfirm();
                setOpen(false);
              }}
            >
              {confirmButtonContent || t('common.confirm')}
            </Button>
          </div>
        </Popover.Content>
      </Popover>
    </>
  );
};
