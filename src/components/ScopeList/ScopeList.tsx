import { List, ListItem } from '@digdir/design-system-react';
import * as React from 'react';

import classes from './ScopeList.module.css';

export interface ScopeListProps {
  scopeList: string[];
}

const ScopeList = ({ scopeList }: ScopeListProps) => {
  return (
    <List borderStyle='dashed'>
      {scopeList.map((scope, i) => (
        <ListItem key={i}>
          <div className={classes.scopeItems}>{scope}</div>
        </ListItem>
      ))}
    </List>
  );
};

export default ScopeList;
