import React from 'react';
import cn from 'classnames';

import classes from './List.module.css';

interface ListItemProps extends React.HtmlHTMLAttributes<HTMLLIElement> {
  children: React.ReactNode;
  onClick?: () => void;
}

// TODO: Make this into a complete ListItem component with avatars, title and subtitle as designed
export const ListItem = ({ children, onClick, className, ...props }: ListItemProps) => {
  return (
    <li
      className={cn(classes.listItem)}
      {...props}
    >
      {onClick ? (
        <button
          className={cn(classes.clickableItem, className)}
          onClick={onClick}
        >
          {children}
        </button>
      ) : (
        <div className={className}>{children}</div>
      )}
    </li>
  );
};
