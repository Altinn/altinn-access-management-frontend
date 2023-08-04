import * as React from 'react';
import cn from 'classnames';

import classes from './ActionBarContent.module.css';
import { useActionBarContext } from './Context';

export interface ActionBarContentProps {
  children?: React.ReactNode;
}

export const ActionBarContent = ({ children }: ActionBarContentProps) => {
  const { open, contentId, headerId, color, size } = useActionBarContext();

  return (
    <>
      {open && (
        <div
          aria-expanded={open}
          id={contentId}
          aria-labelledby={headerId}
          className={cn(classes.actionBarContent, classes[color], classes[size])}
        >
          {children}
        </div>
      )}
    </>
  );
};
