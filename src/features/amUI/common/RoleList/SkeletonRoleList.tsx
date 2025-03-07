import { ListBase, ListItem } from '@altinn/altinn-components';
import { Heading, Paragraph, Skeleton } from '@digdir/designsystemet-react';

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
      <Heading data-size='md'>
        <Skeleton variant='text'>
          <Skeleton
            variant='text'
            width={40}
          />
        </Skeleton>
      </Heading>
      <Paragraph data-size='md'>
        <Skeleton
          variant='text'
          width={100}
        />
      </Paragraph>
      <ListBase>
        {listSkeleton.map((role) => (
          <ListItem
            key={role.id}
            title={role.name}
            data-color='neutral'
            theme='subtle'
            loading
          />
        ))}
      </ListBase>
    </div>
  );
};
