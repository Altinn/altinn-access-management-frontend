import { Button, ButtonColor, ButtonVariant } from '@digdir/design-system-react';
import * as React from 'react';

import { ReactComponent as MinusCircle } from '@/assets/MinusCircle.svg';
import { ReactComponent as AddCircle } from '@/assets/AddCircle.svg';

import classes from './ActionBar.module.css';

export interface ActionBarProps {
  title: string;
  subtitle?: string;
  icon: ActionIconVariant;
  actionCallBack: () => void;
}

export enum ActionIconVariant {
  Add,
  Remove,
}

export const ActionBar = ({
  title,
  subtitle,
  icon = ActionIconVariant.Add,
  actionCallBack,
}: ActionBarProps) => {
  let button;
  switch (icon) {
    case ActionIconVariant.Add:
      button = (
        <Button
          className={classes.actionButton}
          icon={<AddCircle />}
          variant={ButtonVariant.Quiet}
          color={ButtonColor.Success}
          onClick={actionCallBack}
          aria-label={'add'}
        ></Button>
      );
      break;
    case ActionIconVariant.Remove:
      button = (
        <Button
          className={classes.actionButton}
          icon={<MinusCircle />}
          variant={ButtonVariant.Quiet}
          color={ButtonColor.Danger}
          onClick={actionCallBack}
          aria-label={'remove'}
        ></Button>
      );
      break;
  }
  return (
    <div className={classes.actionBar}>
      <div>
        <h4 className={classes.title}>{title}</h4>
        {subtitle && <div className={classes.subtitle}>{subtitle}</div>}
      </div>
      <div className={classes.actionButtonContainer}>{button}</div>
    </div>
  );
};
