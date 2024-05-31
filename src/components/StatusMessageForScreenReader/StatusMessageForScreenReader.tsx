import * as React from 'react';

import classes from './StatusMessageForScreenReader.module.css';

interface statusMessageProps {
  children?: React.ReactNode;
  politenessSetting?: 'off' | 'polite' | 'assertive';
  visible?: boolean;
}

export const StatusMessageForScreenReader = ({
  children,
  politenessSetting = 'polite',
  visible = false,
}: statusMessageProps) => {
  return (
    <div
      role='status'
      aria-live={politenessSetting}
      className={visible ? '' : classes.visuallyHidden}
    >
      {children}
    </div>
  );
};
