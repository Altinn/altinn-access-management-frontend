import { List, ListItem, DsSkeleton, DsParagraph, DsHeading } from '@altinn/altinn-components';

import classes from './roleSection.module.css';

export const SkeletonRoleList = () => {
  const listSkeleton = [
    { id: 0, name: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
    { id: 1, name: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
    { id: 2, name: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
    { id: 3, name: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
    { id: 4, name: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
  ];

  return (
    <div className={classes.areas}>
      <DsHeading data-size='md'>
        <DsSkeleton variant='text'>
          <DsSkeleton
            variant='text'
            width={40}
          />
        </DsSkeleton>
      </DsHeading>
      <DsParagraph data-size='md'>
        <DsSkeleton
          variant='text'
          width={100}
        />
      </DsParagraph>
      <List>
        {listSkeleton.map((role) => (
          <ListItem
            key={role.id}
            title={role.name}
            data-color='neutral'
            variant='subtle'
            loading
          />
        ))}
      </List>
    </div>
  );
};
