import * as React from 'react';
import { useState, isValidElement, cloneElement } from 'react';
import cn from 'classnames';
import {
  useFloating,
  offset,
  useClick,
  useDismiss,
  useInteractions,
  shift,
  autoUpdate,
  useRole,
  FloatingFocusManager,
  FloatingOverlay,
} from '@floating-ui/react';

import classes from './Floatover.module.css';

export interface FloatoverProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  isModal?: boolean;
  className?: string;
  children: React.ReactNode;
  trigger: React.ReactNode;
}

export const Floatover = ({
  children,
  trigger,
  isOpen,
  setIsOpen,
  isModal = false,
  className,
}: FloatoverProps) => {
  const isAutomatedOpen = !setIsOpen;
  const [automatedOpen, setAutomatedOpen] = useState(isOpen ?? false);
  const open = isAutomatedOpen ? automatedOpen : isOpen;
  const onOpenChange = setIsOpen ?? setAutomatedOpen;

  const floatingData = useFloating({
    open,
    onOpenChange,
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [offset(1), shift()],
  });

  const context = floatingData.context;

  const click = useClick(context, { enabled: isAutomatedOpen });
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const openTrigger = () => {
    const triggerElem = isValidElement(trigger)
      ? (trigger as React.ReactElement & React.RefAttributes<HTMLElement>)
      : null;

    if (triggerElem) {
      const childProps = {
        ref: floatingData.refs.setReference,
        ...getReferenceProps(),
      };
      return cloneElement(triggerElem, childProps);
    }
    return null;
  };

  const floatingPopover = () => {
    return (
      <FloatingFocusManager
        context={context}
        modal={false}
      >
        <div
          ref={floatingData.refs.setFloating}
          className={cn(classes.popover, className)}
          style={{
            position: context.strategy,
            top: context.y ?? 0,
            left: context.x ?? 0,
          }}
          {...getFloatingProps()}
        >
          {children}
        </div>
      </FloatingFocusManager>
    );
  };

  const floatingModal = () => (
    <FloatingOverlay
      lockScroll
      className={cn(classes.floatingOverlay, className)}
    >
      <FloatingFocusManager
        context={context}
        modal={true}
      >
        <div
          ref={floatingData.refs.setFloating}
          className={classes.modal}
          style={{
            position: 'fixed',
            top: '5%',
            left: 0,
          }}
          {...getFloatingProps()}
        >
          {children}
        </div>
      </FloatingFocusManager>
    </FloatingOverlay>
  );

  return (
    <>
      {openTrigger()}
      {open && (isModal ? floatingModal() : floatingPopover())}
    </>
  );
};
