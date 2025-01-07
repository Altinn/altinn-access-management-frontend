import React from 'react';
import { Paragraph } from '@digdir/designsystemet-react';
import { AccessAreaListItem as AreaListItem } from '@altinn/altinn-components';

import {
  useGetRightHolderDelegationsQuery,
  type AccessArea,
  type AccessPackage,
} from '@/rtk/features/accessPackageApi';
import type { Party } from '@/rtk/features/lookupApi';

import { DelegatedPackagesList } from '../../AccessPackageSection/DelegatedPackagesList';
import { useDelegationModalContext } from '../DelegationModalContext';

import classes from './AccessPackageSection.module.css';

interface AccessAreaListItemProps {
  accessPackageArea: AccessArea;
  toParty: Party;
  onSelection: (accessPackage: AccessPackage) => void;
  onDelegate: (accessPackage: AccessPackage) => void;
  onRevoke: (accessPackage: AccessPackage) => void;
}

const AccessAreaListItem: React.FC<AccessAreaListItemProps> = ({
  accessPackageArea,
  toParty,
  onSelection,
  onDelegate,
  onRevoke,
}: AccessAreaListItemProps) => {
  const { id, name, description, iconUrl, accessPackages } = accessPackageArea;
  const { data, isFetching } = useGetRightHolderDelegationsQuery(toParty.partyUuid);
  const { expandedAreas, toggleExpanded } = useDelegationModalContext();
  const expanded = expandedAreas.includes(id);

  return (
    <AreaListItem
      name={name}
      expanded={expanded}
      onClick={() => toggleExpanded(!expanded, id)}
      icon={iconUrl}
      id={id}
    >
      <div className={classes.accessAreaContent}>
        <Paragraph size='sm'>{description}</Paragraph>
        {!isFetching && data ? (
          <DelegatedPackagesList
            packageDelegations={data[id] ?? []}
            accessPackages={accessPackages}
            onSelection={(ap: AccessPackage) => onSelection(ap)}
            onDelegate={onDelegate}
            onRevoke={onRevoke}
            toParty={toParty}
          />
        ) : (
          '...laster'
        )}
      </div>
    </AreaListItem>
  );
};

export default AccessAreaListItem;
