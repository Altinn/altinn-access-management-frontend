import * as React from 'react';
import cn from 'classnames';

import classes from './ActionBarContent.module.css';
import { useActionBarContext } from './Context';

export interface ActionBarContentProps {
  children?: React.ReactNode;
}

export const ActionBarContent = ({ children }: ActionBarContentProps) => {
  const { open, contentId, headerId, color } = useActionBarContext();

  return (
    <>
      {open && (
        <div
          aria-expanded={open}
          id={contentId}
          aria-labelledby={headerId}
          className={cn(classes[`actionBarContent__${color}`], classes.actionBarContent, {
            [classes.actionBarContent__open]: open,
          })}
        >
          {children}
        </div>
      )}
    </>
  );
};

export default ActionBarContent;
