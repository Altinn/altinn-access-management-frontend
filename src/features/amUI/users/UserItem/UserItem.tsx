import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Paragraph, Tag } from '@digdir/designsystemet-react';
import { useEffect, useId, useState } from 'react';
import cn from 'classnames';
import { Link } from 'react-router-dom';
import { Avatar } from '@altinn/altinn-components';

import type { FilteredRightHolder } from '../useFilteredRightHolders';
import { ListItem } from '../../common/List';

import classes from './UserItem.module.css';

interface UserProps {
  /** The user object containing user details. */
  user: FilteredRightHolder;
  /** The size of the component */
  size?: 'lg' | 'md' | 'sm';
  /** The color theme of the component */
  color?: 'light' | 'subtle';
  /** Flag to show or hide user roles */
  showRoles?: boolean;
  /** Flag to show or hide the icon */
  icon?: boolean;
  /** Children elements to be rendered inside the component. The item is only expandable if it has children */
  children?: React.ReactNode;
  /** Additional class names for styling */
  className?: string;
}

/**
 * UserItem component renders user information with optional roles and icons.
 * @param {Object} props - The properties object.
 */
export const UserItem = ({
  user,
  size = 'md',
  color = 'light',
  showRoles = true,
  icon = true,
  children,
  className,
}: UserProps) => {
  const headerId = useId();
  const contentId = useId();
  const [isExpanded, setIsExpanded] = useState(false);
  useEffect(
    () => setIsExpanded(user.matchInInheritingRightHolders ?? false),
    [user.matchInInheritingRightHolders],
  );

  const isExpanable = !!(user.inheritingRightHolders && user.inheritingRightHolders.length > 0);

  const UserListRole = ({ role }: { role: string }) => {
    const { t } = useTranslation();
    return (
      <Tag
        size='sm'
        color='warning'
      >
        {t(`user_role.${role}`)}
      </Tag>
    );
  };

  const headerContent = (
    <>
      <Paragraph
        size={size}
        className={classes.headerText}
      >
        {user.name + (user.unitType ? ` ${user.unitType}` : '')}
      </Paragraph>
      {showRoles && (
        <div className={classes.roleListContainer}>
          {user.registryRoles?.map((role) => {
            return (
              <UserListRole
                key={role}
                role={role}
              />
            );
          })}
        </div>
      )}
    </>
  );

  return (
    user && (
      <>
        {isExpanable ? (
          <ListItem
            id={headerId}
            aria-expanded={isExpanded}
            aria-controls={contentId}
            onClick={() => setIsExpanded((oldExpanded) => !oldExpanded)}
            className={cn(
              classes.user,
              classes[size],
              classes[color],
              classes.clickable,
              className,
            )}
          >
            {icon && (
              <Avatar
                size={size}
                type='company'
                name={user.name}
                className={classes.icon}
              />
            )}
            {headerContent}
          </ListItem>
        ) : (
          <Link
            to={`${user.partyUuid}`}
            className={cn(
              classes.user,
              classes[size],
              classes[color],
              classes.clickable,
              className,
            )}
          >
            {icon && (
              <Avatar
                size={size}
                name={user.name}
                className={classes.icon}
              />
            )}
            {headerContent}
          </Link>
        )}
        {isExpanded && (
          <div
            id={contentId}
            aria-expanded={isExpanded}
            aria-labelledby={headerId}
            className={classes.expandedContent}
          >
            {children}
          </div>
        )}
      </>
    )
  );
};
