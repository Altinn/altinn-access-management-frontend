import React, { useState } from 'react';
import type { UserType } from '@/components/List/TestDataUserList';
import { Button, Heading, Tag } from '@digdir/designsystemet-react';
import classes from './List.module.css';
import { useTranslation } from 'react-i18next';

import { ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons';

import { ListItem } from '@/components/List/ListItem';
import { List } from '@/components/List/List';
import { UserIcon } from '@/components/UserIcon/UserIcon';
import { testUsers as users } from '@/components/List/TestDataUserList';

export const UsersList = () => {
  const { t } = useTranslation();
  return (
    <List
      compact
      heading={<Heading level={2}>{t('users_page.user_list_heading')}</Heading>}
    >
      {users.map((user) => (
        <UserListItem
          key={user.name}
          user={user}
        />
      ))}
    </List>
  );
};
const UserListItem = ({ user }: { user: UserType }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isExpanable = !!(user.users && user.users.length > 0);
  const children = (
    <>
      <div>{user.name}</div>
      <div className={classes.roleListContainer}>
        {user.roles?.map((role) => {
          return (
            <Tag
              key={role}
              size='sm'
              color='warning'
            >
              {role}
            </Tag>
          );
        })}
      </div>
    </>
  );

  return (
    <>
      <ListItem>
        {isExpanable ? (
          <Button
            onClick={() => setIsExpanded((oldExpanded) => !oldExpanded)}
            variant='tertiary'
            className={classes.listItemContent}
          >
            <UserIcon
              icon={
                isExpanded ? (
                  <ChevronUpIcon fontSize={'2rem'} />
                ) : (
                  <ChevronDownIcon fontSize={'2rem'} />
                )
              }
            />
            {children}
          </Button>
        ) : (
          <div className={classes.listItemContent}>
            <UserIcon icon={user.name.charAt(0)} />
            {children}
          </div>
        )}
      </ListItem>
      {isExpanded && user.users && (
        <List compact>
          {user.users.map((user) => (
            <UserListItem
              key={user.name}
              user={user}
            />
          ))}
        </List>
      )}
    </>
  );
};
