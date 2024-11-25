import React from 'react';
import { ListItem } from '@altinn/altinn-components';
import { Paragraph } from '@digdir/designsystemet-react';

import type { AccessArea } from '@/rtk/features/accessPackageApi';

import classes from './AccessPackageSection.module.css';

interface AccessAreaListItemProps {
  /** The area to be presented */
  accessPackageArea: AccessArea;
  /** The content to be displayed as expandable content inside the ActionBar. */
  children?: React.ReactNode;
}

export const DelegatedAreaListItem: React.FC<AccessAreaListItemProps> = ({
  accessPackageArea,
  children,
}) => {
  const { id, name, description, iconUrl } = accessPackageArea;
  const [expanded, setExpanded] = React.useState(false);
  return (
    <>
      <li key={id}>
        <ListItem
          id={id}
          collapsible
          expanded={expanded}
          as='button'
          onClick={() => setExpanded(!expanded)}
          linkIcon='chevron-right'
          size='lg'
          title={name}
          avatar={{
            type: 'company',
            imageUrl: iconUrl,
            name: name,
          }}
        />
      </li>
      {expanded && (
        <div className={classes.accessAreaContent}>
          <Paragraph size='sm'>{description}</Paragraph>
          {children}
        </div>
      )}
    </>
  );
};
