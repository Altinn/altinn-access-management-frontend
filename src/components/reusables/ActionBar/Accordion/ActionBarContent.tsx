import * as React from 'react';

import { useActionBarContext } from './Context';

export interface ActionBarContentProps {
  children?: React.ReactNode;
}

export const ActionBarContent = ({ children }: ActionBarContentProps) => {
  const { open, contentId, headerId } = useActionBarContext();

  return (
    <div>
      {open && (
        <div
          aria-expanded={open}
          id={contentId}
          aria-labelledby={headerId}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default ActionBarContent;
