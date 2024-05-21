import * as React from 'react';

import classes from './StatusMessageForScreenReader.module.css';

interface statusMessageProps {
  children?: React.ReactNode;
  politenessSetting?: 'off' | 'polite' | 'assertive';
  visibility?: boolean;
}

export const StatusMessageForScreenReader = ({
  children,
  politenessSetting = 'polite',
  visibility = false,
}: statusMessageProps) => {
  return (
    <div
      role='status'
      aria-live={politenessSetting}
      className={visibility ? '' : classes.visuallyHidden}
    >
      {children}
    </div>
  );
};
