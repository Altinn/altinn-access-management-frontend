import React from 'react';
import { ListItem } from '@altinn/altinn-components';
import { Paragraph } from '@digdir/designsystemet-react';

import type { AccessArea, AccessPackage } from '@/rtk/features/accessPackageApi';
import { List } from '@/components';

interface AccessAreaListItemProps {
  accessPackageArea: AccessArea;
  onSelection: (accessPackage: AccessPackage) => void;
}

const AccessAreaListItem: React.FC<AccessAreaListItemProps> = ({
  accessPackageArea,
  onSelection,
}) => {
  const { id, name, description, iconUrl, accessPackages } = accessPackageArea;
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
          size='md'
          title={name}
          avatar={{
            type: 'company',
            imageUrl: iconUrl,
            name: name,
          }}
        />
      </li>
      {expanded && (
        <>
          <Paragraph size='xs'>{description}</Paragraph>
          <List>
            {accessPackages?.map((item) => (
              <>
                <li key={item.id}>
                  <ListItem
                    id={item.id}
                    onClick={() => onSelection(item)}
                    size='xs'
                    title={item.name}
                    color='accent'
                    as='button'
                  />
                </li>
              </>
            ))}
          </List>
        </>
      )}
    </>
  );
};

export default AccessAreaListItem;
