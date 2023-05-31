import * as React from 'react';
import { useState, useEffect, isValidElement, cloneElement } from 'react';
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

/**
 * Floatover Component
 *
 * This component renders a local popover or fullscreen modal
 *
 * @component
 * @example
 * <Floatover
 *   isOpen={true}
 *   setIsOpen={handleOpenChange}
 *   isModal={false}
 *   className="my-floatover"
 *   trigger={<button>Open Floatover</button>}
 * >
 *   <div>Floatover Content</div>
 * </Floatover>
 *
 * @param {boolean} [isOpen=false] - Indicates whether the Floatover is open or closed, use this to control its open-state externally
 * @param {function} [setIsOpen] - Callback function to handle the open state change, this should set the isOpen state.
 * @param {boolean} [isModal=false] - When true, the floatover will appear as a full-screen modal. Otherwise, it will appear as a popover
 * @param {string} [className] - Additional CSS class for the Floatover container
 * @param {React.ReactNode} children - Content to be displayed inside the Floatover
 * @param {React.ReactNode} trigger - The trigger element that opens the Floatover
 * @returns {React.ReactNode} Rendered component
 */
export const Floatover = ({
  children,
  trigger,
  isOpen = false,
  setIsOpen,
  isModal = false,
  className,
  ...restProps
}: FloatoverProps) => {
  const isAutomatedOpen = !setIsOpen;
  const [automatedOpen, setAutomatedOpen] = useState(isOpen ?? false);
  const open = isAutomatedOpen ? automatedOpen : isOpen;
  const onOpenChange = setIsOpen ?? setAutomatedOpen;
  const [renderFloatover, setRenderFloatover] = useState(open);

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
          className={cn(classes.popover, className, {
            [classes.open]: open,
            [classes.closed]: !open,
          })}
          style={{
            position: context.strategy,
            top: context.y ?? 0,
            left: context.x ?? 0,
          }}
          {...getFloatingProps()}
          {...restProps}
        >
          {children}
        </div>
      </FloatingFocusManager>
    );
  };

  const floatingModal = () => (
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
          className={cn(classes.modal, className, {
            [classes.open]: open,
            [classes.closed]: !open,
          })}
          style={{
            position: 'fixed',
            left: 0,
          }}
          {...getFloatingProps()}
          {...restProps}
        >
          {children}
        </div>
      </FloatingFocusManager>
    </FloatingOverlay>
  );

  useEffect(() => {
    if (open === renderFloatover) {
      // Do nothing
    } else if (!open) {
      // Delay removal until closing animation is done
      setTimeout(() => {
        setRenderFloatover(false);
      }, 200);
    } else {
      setRenderFloatover(open);
    }
  }, [open]);

  return (
    <>
      {openTrigger()}
      {renderFloatover && (isModal ? floatingModal() : floatingPopover())}
    </>
  );
};
