import React from 'react';
import classes from './UserIcon.module.css';

export const UserIcon = ({ userName }: { userName: string }) => {
  return (
    userName && (
      <span
        data-user-initials={userName.charAt(0)}
        className={classes.userIcon}
      />
    )
  );
};
