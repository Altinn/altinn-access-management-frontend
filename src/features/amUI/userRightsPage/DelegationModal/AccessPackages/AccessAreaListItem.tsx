import React from 'react';
import { ListItem } from '@altinn/altinn-components';

import type { AccessArea, AccessPackage } from '@/rtk/features/accessPackageApi';
import { List } from '@/components';

interface AccessAreaListItemProps {
  accessPackageArea: AccessArea;
  onSelection: (item: AccessPackage) => void;
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
          description={description}
          avatar={{
            type: 'company',
            imageUrl: iconUrl,
            name: name,
          }}
        />
      </li>
      {expanded && (
        <>
          {/* <Paragraph size='xs'>{description}</Paragraph> s */}
          <List>
            {accessPackages?.map((item) => (
              <li key={item.id}>
                <ListItem
                  id={item.id}
                  onClick={() => onSelection(item)}
                  size='xs'
                  title={item.name}
                  // description={item.description}
                  color='accent'
                />
              </li>
            ))}
          </List>
        </>
      )}
    </>
  );
};

export default AccessAreaListItem;
