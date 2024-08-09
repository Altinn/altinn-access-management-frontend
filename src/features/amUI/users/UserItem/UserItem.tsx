import * as React from 'react';
import { useTranslation } from 'react-i18next';
import classes from './UserItem.module.css';
import { UserIcon } from '@/components/UserIcon/UserIcon';
import { type RightHolder } from '@/rtk/features/userInfo/userInfoApi';
import { Button, Paragraph, Tag } from '@digdir/designsystemet-react';
import { ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons';
import { useId, useState } from 'react';
import cn from 'classnames';

interface UserProps {
  /** The user object containing user details. */
  user: RightHolder;
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
  const isExpanable = !!(user.inheritingRightHolders && user.inheritingRightHolders.length > 0);

  const avatar = <span>{user.name.charAt(0)}</span>;

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
          <Button
            id={headerId}
            aria-expanded={isExpanded}
            aria-controls={contentId}
            onClick={() => setIsExpanded((oldExpanded) => !oldExpanded)}
            variant='tertiary'
            className={cn(
              classes.user,
              classes[size],
              classes[color],
              isExpanable && classes.expandable,
              className,
            )}
            fullWidth
          >
            {icon && (
              <UserIcon
                size={size}
                icon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                className={classes.icon}
              />
            )}
            {headerContent}
          </Button>
        ) : (
          <div className={cn(classes.user, classes[size], classes[color], className)}>
            {icon && (
              <UserIcon
                size={size}
                icon={avatar}
                className={classes.icon}
              />
            )}
            {headerContent}
          </div>
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
