import { List, ListItem, DsSkeleton } from '@altinn/altinn-components';

import classes from './roleSection.module.css';
import { url } from 'inspector';

export const SkeletonRoleList = () => {
  const listSkeleton = [
    { id: 0, name: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
    { id: 1, name: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
    { id: 2, name: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
    { id: 3, name: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
    { id: 4, name: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
  ];

  return (
    <div className={classes.roleLists}>
      <List>
        {listSkeleton.map((role) => (
          <ListItem
            key={role.id}
            title={role.name}
            data-color='neutral'
            loading
            size='md'
          />
        ))}
      </List>
    </div>
  );
};
