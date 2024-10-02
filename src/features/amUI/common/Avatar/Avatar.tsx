import React from 'react';
import cn from 'classnames';
import { Paragraph } from '@digdir/designsystemet-react';

import classes from './Avatar.module.css';

export type AvatarProfile = 'organization' | 'person' | 'serviceOwner';

interface AvatarProps {
  /** The size of the component */
  size: 'lg' | 'md' | 'sm';
  /** The name of the avatars owner*/
  name?: string;
  /** If displaying an icon istead of initials */
  icon?: React.ReactNode;
  /** Determines the shape of the avatar */
  profile?: AvatarProfile;
  /** Additional class names for styling */
  className?: string;
}

export const Avatar = ({ icon, name, size = 'md', profile = 'person', className }: AvatarProps) => {
  return (
    <div
      className={cn(classes.avatar, classes[size], classes[profile], className)}
      aria-hidden
    >
      {name && (
        <Paragraph
          asChild
          size={size}
          className={classes.initial}
        >
          <span>{name.charAt(0)}</span>
        </Paragraph>
      )}
      {icon && <span className={cn(classes[size], classes.icon)}>{icon}</span>}
    </div>
  );
};
