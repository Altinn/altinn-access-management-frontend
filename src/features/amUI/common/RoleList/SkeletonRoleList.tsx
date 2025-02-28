import { ListBase, ListItem, Skeleton } from '@altinn/altinn-components';
import { Heading, Paragraph } from '@digdir/designsystemet-react';

import classes from './roleSection.module.css';

export const SkeletonRoleList = () => {
  const listSkeleton = [
    { id: 0, name: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
    { id: 1, name: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
    { id: 2, name: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
    { id: 3, name: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
    { id: 4, name: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
  ];

  const descriptionSkeleton = `xxxxxxxxxxxxxxxxxxxxxx xxxxxxx x xxxxxxxxxxxxxx 
  xxxxxxxxxxxxxxxxxx xx xxxxxx xxxxxxxxx xxxxxxxxxxxxxxxxxxxxxxxxxxxxx xxxxxxxxxxxxxxxxxxxxxxx`;

  return (
    <div className={classes.areas}>
      <Heading size='md'>
        <Skeleton
          variant='text'
          loading
        >
          xx xxxxxx xxxxxxx
        </Skeleton>
      </Heading>
      <Paragraph size='md'>
        <Skeleton
          variant='text'
          loading
          size='sm'
        >
          {descriptionSkeleton}
        </Skeleton>
      </Paragraph>
      <ListBase>
        {listSkeleton.map((role) => (
          <ListItem
            key={role.id}
            title={role.name}
            color='neutral'
            theme='subtle'
            loading
          />
        ))}
      </ListBase>
    </div>
  );
};
