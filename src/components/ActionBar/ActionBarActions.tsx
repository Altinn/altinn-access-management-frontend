/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import * as React from 'react';

export interface ActionBarActionsProps {
  children: React.ReactNode;
}

export const ActionBarActions = ({ children }: ActionBarActionsProps) => {
  const handleActionClick = (event: React.MouseEvent<HTMLParagraphElement, MouseEvent>) => {
    event.stopPropagation();
  };

  return <div onClick={handleActionClick}>{children}</div>;
};
