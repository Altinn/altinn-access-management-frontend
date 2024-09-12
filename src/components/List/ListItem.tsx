import React from 'react';
import classNames from 'classnames';

import classes from './List.module.css';

interface ListItemProps extends React.HtmlHTMLAttributes<HTMLLIElement> {
  children: React.ReactNode;
}

export const ListItem = ({ children, className, ...props }: ListItemProps) => {
  return (
    <li
      className={classNames(classes.listItem, className)}
      {...props}
    >
      {children}
    </li>
  );
};
