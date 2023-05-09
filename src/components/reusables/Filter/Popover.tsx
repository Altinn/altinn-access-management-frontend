import * as React from 'react';
import { Button } from '@digdir/design-system-react';
import { createContext, useContext, useMemo, isValidElement, cloneElement } from 'react';
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

import classes from './Popover.module.css';

interface IPopoverSettings extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isModal?: boolean;
}

interface IPopoverNodes {
  children: React.ReactNode;
  trigger: React.ReactNode;
}

export type PopoverProps = IPopoverSettings & IPopoverNodes;

const makeContextValue = ({ isOpen, setIsOpen, isModal, ...rest }: IPopoverSettings) => {
  const floatingData = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [offset(1), shift()],
  });

  const context = floatingData.context;

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  return useMemo(
    () => ({
      isOpen,
      setIsOpen,
      isModal,
      getReferenceProps,
      getFloatingProps,
      ...floatingData,
    }),
    [isOpen, setIsOpen, isModal, floatingData, getReferenceProps, getFloatingProps],
  );
};

type ContextType = ReturnType<typeof makeContextValue> | null;
const PopoverContext = createContext<ContextType>(null);

export const usePopoverConext = () => {
  const context = useContext(PopoverContext);

  if (context == null) {
    throw new Error('Popover components must be wrapped in <Popover />');
  }

  return context;
};

export const Popover = ({
  children,
  trigger,
  isOpen = false,
  setIsOpen,
  isModal = false,
}: PopoverProps) => {
  // const contextValue = makeContextValue({ isOpen, setIsOpen, isModal });

  const floatingData = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [offset(1), shift()],
  });

  const context = floatingData.context;

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const popoverTrigger = () => {
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
          className={classes.popover}
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

  const floatingModal = () => {
    return (
      <FloatingOverlay
        lockScroll
        className={classes.floatingOverlay}
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
              top: '10%',
              left: 0,
            }}
            {...getFloatingProps()}
          >
            {children}
          </div>
        </FloatingFocusManager>
      </FloatingOverlay>
    );
  };

  return (
    <>
      {popoverTrigger()}
      {isOpen && (isModal ? floatingModal() : floatingPopover())}
    </>
  );
};
