import * as React from 'react';
import { forwardRef } from 'react';

import { useDialogContext } from './DialogContext';

export const DialogClose = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(function DialogClose(props, ref) {
  const { setOpen } = useDialogContext();
  return (
    <button
      type='button'
      {...props}
      ref={ref}
      onClick={() => {
        setOpen(false);
      }}
    />
  );
});
