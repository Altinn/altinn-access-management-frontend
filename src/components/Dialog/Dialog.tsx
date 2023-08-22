import * as React from 'react';
import { useFloating, useClick, useDismiss, useRole, useInteractions } from '@floating-ui/react';

import { DialogContext } from './DialogContext';

export interface DialogProps {
  initialOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function useDialog({
  initialOpen = false,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: DialogProps = {}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(initialOpen);
  const [labelId, setLabelId] = React.useState<string | undefined>();
  const [descriptionId, setDescriptionId] = React.useState<string | undefined>();

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

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

export function Dialog({
  children,
  ...options
}: {
  children: React.ReactNode;
} & DialogProps) {
  const dialog = useDialog(options);
  return <DialogContext.Provider value={dialog}>{children}</DialogContext.Provider>;
}
