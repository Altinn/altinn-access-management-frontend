import React, { useState, useMemo } from 'react';
import { Button, Heading, Tag, Pagination } from '@digdir/designsystemet-react';
import classes from './UsersList.module.css';
import { useTranslation } from 'react-i18next';
import type { RightHolder } from '@/rtk/features/userInfo/userInfoApi';
import { useGetRightHoldersQuery } from '@/rtk/features/userInfo/userInfoApi';
import { getArrayPage, getTotalNumOfPages } from '@/resources/utils';

import { ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons';

import { ListItem } from '@/components/List/ListItem';
import { List } from '@/components/List/List';
import { UserIcon } from '@/components/UserIcon/UserIcon';

export const UsersList = () => {
  const { t } = useTranslation();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: rightHolders } = useGetRightHoldersQuery();

  const [pageEntrees, numOfPages] = useMemo(() => {
    if (!rightHolders) {
      return [[], 1];
    }
    const numPages = getTotalNumOfPages(rightHolders, pageSize);
    return [getArrayPage(rightHolders, currentPage, pageSize), numPages];
  }, [rightHolders, currentPage]);

  return (
    <div className={classes.usersList}>
      <List
        compact
        heading={
          <Heading
            level={2}
            size='lg'
            spacing
          >
            {t('users_page.user_list_heading')}
          </Heading>
        }
      >
        {pageEntrees.map((user) => (
          <UserListItem
            key={user.partyUuid}
            user={user}
          />
        ))}
      </List>
      <Pagination
        className={classes.pagination}
        size='sm'
        hideLabels={true}
        currentPage={currentPage}
        totalPages={numOfPages}
        onChange={(newPage) => setCurrentPage(newPage)}
        nextLabel='Neste'
        previousLabel='Forrige'
      />
    </div>
  );
};
const UserListItem = ({ user }: { user: RightHolder }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isExpanable = !!(user.inheritingRightHolders && user.inheritingRightHolders.length > 0);
  const children = (
    <>
      <div>{user.name + (user.unitType ? ` ${user.unitType}` : '')}</div>
      <div className={classes.roleListContainer}>
        {user.registryRoles?.map((role) => {
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
            fullWidth
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
      {isExpanded && user.inheritingRightHolders && (
        <List compact>
          {user.inheritingRightHolders.map((user) => (
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
