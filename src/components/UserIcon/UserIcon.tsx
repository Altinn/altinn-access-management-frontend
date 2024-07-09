import React from 'react';
import classes from './UserIcon.module.css';

interface UserIconProps {
  icon: React.ReactNode;
}

export const UserIcon = ({ icon }: UserIconProps) => {
  return (
    icon && (
      <div
        className={classes.userIcon}
        aria-hidden
      >
        {icon}
      </div>
    )
  );
};
