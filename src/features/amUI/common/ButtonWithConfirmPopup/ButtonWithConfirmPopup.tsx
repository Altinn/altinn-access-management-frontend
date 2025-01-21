import type { PopoverProps } from '@digdir/designsystemet-react';
import { Paragraph, Popover } from '@digdir/designsystemet-react';
import React, { useRef } from 'react';
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
  const [open, setOpen] = React.useState(false);
  const id = useRef(Math.random().toString(36).substring(7));
  return (
    <>
      <Button
        popovertarget={id.current}
        onClick={() => setOpen(!open)}
        {...triggerButtonProps}
      >
        {triggerButtonContent}
      </Button>
      <Popover
        id={id.current}
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
    </>
  );
};
