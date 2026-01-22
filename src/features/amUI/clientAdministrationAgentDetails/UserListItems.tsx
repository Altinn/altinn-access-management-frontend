import React, { type ReactNode, useMemo, useState } from 'react';
import type { UserListItemProps } from '@altinn/altinn-components';
import { List, UserListItem } from '@altinn/altinn-components';
import classes from './ClientAdministrationAgentClientsList.module.css';

export type UserListItemData = UserListItemProps & {
  children?: ReactNode;
};

interface UserListItemsProps {
  items: UserListItemData[];
}

export const UserListItems = ({ items }: UserListItemsProps) => {
  const [expandedIds, setExpandedIds] = useState<string[]>(() =>
    items.filter((item) => item.expanded).map((item) => item.id),
  );

  const expandedIdsSet = useMemo(() => new Set(expandedIds), [expandedIds]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prevExpanded) =>
      prevExpanded.includes(id)
        ? prevExpanded.filter((expandedId) => expandedId !== id)
        : [...prevExpanded, id],
    );
  };

  return (
    <List>
      {items.map(({ children, ...item }) => {
        const collapsible = item.collapsible ?? !!children;
        const expanded = collapsible ? expandedIdsSet.has(item.id) : item.expanded;
        const handleClick = () => {
          item.onClick?.();
          if (collapsible) {
            toggleExpanded(item.id);
          }
        };

        return (
          <UserListItem
            key={item.id}
            {...item}
            collapsible={collapsible}
            expanded={expanded}
            onClick={collapsible ? handleClick : item.onClick}
          >
            <div className={classes.accessRoleItem}>{children}</div>
          </UserListItem>
        );
      })}
    </List>
  );
};
