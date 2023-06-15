import * as React from 'react';

import classes from './ScopeList.module.css';

export interface ScopeListProps {
  scopeList: string[];
}

const ScopeList = ({ scopeList }: ScopeListProps) => {
  return (
    <ul>
      {scopeList.map((scope, i) => (
        <li key={i}>
          <div className={classes.scopeItems}>{scope}</div>
        </li>
      ))}
    </ul>
  );
};

export default ScopeList;
