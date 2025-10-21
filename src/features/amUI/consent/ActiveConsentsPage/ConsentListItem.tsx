import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DsSkeleton, List, ListItem } from '@altinn/altinn-components';
import { HandshakeIcon } from '@navikt/aksel-icons';

import classes from './ActiveConsentsPage.module.css';

interface ConsentListItemProps {
  title: string;
  subItems: { id: string; title: string; isPoa: boolean }[];
  partyType?: string;
  isLoading?: boolean;
  onClick?: (consentId: string) => void;
}
export const ConsentListItem = ({
  title,
  subItems,
  partyType,
  isLoading,
  onClick,
}: ConsentListItemProps): React.ReactNode => {
  const { t } = useTranslation();

  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const partyColor = partyType === 'Person' ? 'person' : 'company';

  return (
    <ListItem
      title={{ as: 'h3', children: title }}
      icon={{
        svgElement: HandshakeIcon,
        theme: 'surface',
        color: partyColor,
      }}
      as='button'
      size='md'
      loading={isLoading}
      collapsible
      expanded={isExpanded}
      interactive={!!onClick}
      badge={{ label: subItems.length, color: partyColor }}
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
                  <>
                    {item.isPoa ? t('active_consents.see_poa') : t('active_consents.see_consent')}
                  </>
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
