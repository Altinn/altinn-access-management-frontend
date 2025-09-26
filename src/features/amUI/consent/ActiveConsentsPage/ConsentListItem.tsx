import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DsSkeleton, List, ListItem } from '@altinn/altinn-components';
import { HandshakeIcon } from '@navikt/aksel-icons';

import classes from './ActiveConsentsPage.module.css';

interface ConsentListItemProps {
  title: string;
  subItems: { id: string; title: string; badgeText: string }[];
  isLoading?: boolean;
  onClick?: (consentId: string) => void;
}
export const ConsentListItem = ({
  title,
  subItems,
  isLoading,
  onClick,
}: ConsentListItemProps): React.ReactNode => {
  const { t } = useTranslation();

  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  return (
    <ListItem
      title={{ as: 'h3', children: title }}
      icon={{ svgElement: HandshakeIcon, theme: 'surface' }}
      as='button'
      size='md'
      loading={isLoading}
      collapsible
      expanded={isExpanded}
      interactive={!!onClick}
      badge={{ label: subItems.length }}
      onClick={() => setIsExpanded((old) => !old)}
    >
      <List className={classes.expandedListItem}>
        {subItems.map((item) => (
          <ListItem
            key={item.id}
            icon={{ svgElement: HandshakeIcon }}
            title={{ as: 'h4', children: item.title }}
            as='button'
            loading={isLoading}
            interactive={!!onClick}
            onClick={onClick ? () => onClick(item.id) : undefined}
            badge={
              <div className={classes.consentBadge}>
                {isLoading ? (
                  <DsSkeleton
                    variant='text'
                    width={20}
                  />
                ) : (
                  <>{item.badgeText}</>
                )}
              </div>
            }
            linkIcon
          />
        ))}
      </List>
    </ListItem>
  );
};
