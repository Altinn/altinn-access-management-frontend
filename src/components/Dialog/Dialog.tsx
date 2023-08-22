import * as React from 'react';
import { useFloating, useClick, useDismiss, useRole, useInteractions } from '@floating-ui/react';

import { DialogContext } from './DialogContext';

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function useDialog({
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: DialogProps = {}) {
  const [labelId, setLabelId] = React.useState<string | undefined>();
  const [descriptionId, setDescriptionId] = React.useState<string | undefined>();

  const open = controlledOpen;
  const setOpen = setControlledOpen;

  const data = useFloating({
    open,
    onOpenChange: setOpen,
  });

  const context = data.context;

  const click = useClick(context, {
    enabled: controlledOpen == null,
  });
  const dismiss = useDismiss(context, { outsidePressEvent: 'mousedown' });
  const role = useRole(context);

  const interactions = useInteractions([click, dismiss, role]);

  return React.useMemo(
    () => ({
      open,
      setOpen,
      ...interactions,
      ...data,
      labelId,
      descriptionId,
      setLabelId,
      setDescriptionId,
    }),
    [open, setOpen, interactions, data, labelId, descriptionId],
  );
}

// If you need to develop this component further, see: https://codesandbox.io/s/charming-bush-47epk2?file=/src/App.tsx
export function Dialog({
  children,
  ...options
}: {
  children: React.ReactNode;
} & DialogProps) {
  const dialog = useDialog(options);
  return <DialogContext.Provider value={dialog}>{children}</DialogContext.Provider>;
}
