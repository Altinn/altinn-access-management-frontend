import React from 'react';
import classes from './List.module.css';

export const ListItem = ({ children }: { children: React.ReactNode }) => {
  return <li className={classes.listItem}>{children}</li>;
};
