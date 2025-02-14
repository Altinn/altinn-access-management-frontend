import { AccessAreaListItem } from '@altinn/altinn-components';
import { Paragraph } from '@digdir/designsystemet-react';

import type { AccessArea } from '@/rtk/features/accessPackageApi';

import classes from './AccessPackageSection.module.css';

interface AccessAreaListItemProps {
  /** The area to be presented */
  accessPackageArea: AccessArea;
  /** The badge label to be displayed */
  badgeLabel: string;
  /** External control of the Areas expanded state */
  expanded: boolean;
  /** Toggle the external expanded state */
  toggleExpanded: () => void;
  /** The content to be displayed as expandable content inside the ActionBar. */
  children?: React.ReactNode;
}

export const DelegatedAreaListItem: React.FC<AccessAreaListItemProps> = ({
  accessPackageArea,
  badgeLabel,
  expanded,
  toggleExpanded,
  children,
}: AccessAreaListItemProps) => {
  const { id, name, description, iconUrl } = accessPackageArea;
  return (
    <>
      <AccessAreaListItem
        id={id}
        size='lg'
        iconUrl={iconUrl}
        name={name}
        badgeText={badgeLabel}
        colorTheme='company'
        onClick={toggleExpanded}
        expanded={expanded}
      >
        {expanded && (
          <div className={classes.accessAreaContent}>
            <Paragraph size='sm'>{description}</Paragraph>
            {children}
          </div>
        )}
      </AccessAreaListItem>
    </>
  );
};
