import React from 'react';
import classes from './UserIcon.module.css';
import cn from 'classnames';
import { Paragraph } from '@digdir/designsystemet-react';

interface UserIconProps {
  /** The icon or letter to be displayed */
  icon: React.ReactNode;
  /** The size of the component */
  size: 'lg' | 'md' | 'sm';
  /** Additional class names for styling */
  className?: string;
}

export const UserIcon = ({ icon, size = 'md', className }: UserIconProps) => {
  return (
    icon && (
      <div
        className={cn(classes.userIcon, classes[size], className)}
        aria-hidden
      >
        <Paragraph
          asChild
          size={size}
          className={classes.icon}
        >
          {icon}
        </Paragraph>
      </div>
    )
  );
};
