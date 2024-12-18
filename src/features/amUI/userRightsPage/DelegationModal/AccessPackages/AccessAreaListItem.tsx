import React from 'react';
import { Paragraph } from '@digdir/designsystemet-react';
import { AccessPackageList, AccessAreaListItem as AreaListItem } from '@altinn/altinn-components';

import type { AccessArea, AccessPackage } from '@/rtk/features/accessPackageApi';

interface AccessAreaListItemProps {
  accessPackageArea: AccessArea;
  onSelection: (accessPackage: AccessPackage) => void;
}

const AccessAreaListItem: React.FC<AccessAreaListItemProps> = ({
  accessPackageArea,
  onSelection,
}: AccessAreaListItemProps) => {
  const { id, name, description, iconUrl, accessPackages } = accessPackageArea;
  const [expanded, setExpanded] = React.useState(false);
  return (
    <AreaListItem
      name={name}
      expanded={expanded}
      onClick={() => setExpanded(!expanded)}
      icon={iconUrl}
      id={id}
    >
      <>
        <Paragraph size='xs'>{description}</Paragraph>
        <AccessPackageList
          items={accessPackages.map((item) => ({
            id: item.id,
            title: item.name,
            description: `${item.resources.length} tjenester`,
            onClick: () => onSelection(item),
          }))}
        />
      </>
    </AreaListItem>
  );
};

export default AccessAreaListItem;
