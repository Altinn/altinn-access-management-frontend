import type { PopoverProps, PopoverTriggerProps } from '@digdir/designsystemet-react';
import { Paragraph, Popover } from '@digdir/designsystemet-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ButtonProps } from '@altinn/altinn-components';
import { Button } from '@altinn/altinn-components';

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
      <Popover.Context {...props}>
        <Popover.Trigger
          {...triggerButtonProps}
          onClick={() => setOpen(!open)}
        >
          {triggerButtonContent}
        </Popover.Trigger>
        <Popover
          open={open}
          onClose={() => setOpen(false)}
          {...popoverProps}
        >
          <Paragraph className={classes.confirmPopupMessage}>{message}</Paragraph>
          <div className={classes.confirmPopupButtons}>
            <Button
              variant='outline'
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
        </Popover>
      </Popover.Context>
    </>
  );
};
