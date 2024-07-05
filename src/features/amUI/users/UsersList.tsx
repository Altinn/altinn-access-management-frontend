import React, { ReactNode, useState } from 'react';
import { UserType } from '../../../components/List/TestDataUserList';
import { Button, Heading, Tag } from '@digdir/designsystemet-react';
import classes from './List.module.css';
import { useTranslation } from 'react-i18next';

import { ChevronDownCircleIcon, ChevronUpCircleIcon } from '@navikt/aksel-icons';

import { ListItem } from '@/components/List/ListItem';
import { List } from '@/components/List/List';
import { UserIcon } from '@/components/UserIcon/UserIcon';
import { testUsers as users } from '@/components/List/TestDataUserList';

export const UsersList = () => {
  const { t } = useTranslation();
  return (
    <>
      <List
        compact
        heading={<Heading level={2}>{t('users_page.user_list_heading')}</Heading>}
      >
        {users.map((user) => {
          const [isExpanded, setIsExpanded] = useState(false);
          return (
            <>
              <UserListItem
                isExpanable={!!(user.users && user.users.length > 0)}
                user={user}
                isExpanded={isExpanded}
                toggleExpanded={() => setIsExpanded(!isExpanded)}
              />

              {isExpanded && user.users && (
                <List compact>
                  {user.users.map((user) => (
                    <UserListItem user={user} />
                  ))}
                </List>
              )}
            </>
          );
        })}
      </List>
    </>
  );
};

const UserListItem = ({
  user,
  isExpanded,
  isExpanable = false,
  toggleExpanded,
}: {
  user: UserType;
  isExpanded?: boolean;
  isExpanable?: boolean;
  toggleExpanded?: () => void;
}) => {
  return (
    <ListItem>
      <div className={classes.listItemContent}>
        {isExpanable ? (
          <>
            <Button
              onClick={toggleExpanded}
              variant='tertiary'
              icon
            >
              {isExpanded ? (
                <ChevronUpCircleIcon fontSize={'3.3rem'} />
              ) : (
                <ChevronDownCircleIcon fontSize={'3.3rem'} />
              )}
              {user.name}
            </Button>
          </>
        ) : (
          <>
            <UserIcon userName={user.name} /> {user.name}
          </>
        )}
        {user.role && <Tag>{user.role}</Tag>}
      </div>
    </ListItem>
  );
};
