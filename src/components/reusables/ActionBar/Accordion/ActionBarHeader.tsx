/* eslint-disable @typescript-eslint/restrict-template-expressions */
import * as React from 'react';
import cn from 'classnames';

import { middleText } from '../../CompactDeletableListItem/CompactDeletableListItem.module.css';

import classes from './ActionBarHeader.module.css';
import { useActionBarContext } from './Context';
import { ActionBarIcon } from './ActionBarIcon';

export interface ActionBarHeaderProps {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  subtitle?: React.ReactNode;
  centerText?: React.ReactNode;
}

export const ActionBarHeader = ({ title, actions, subtitle, centerText }: ActionBarHeaderProps) => {
  const { onClick, open, headerId, contentId, color } = useActionBarContext();

  return (
    <div
      className={cn(classes.actionBarHeader, classes[`actionBarHeader__${color}`], {
        [classes.actionBarHeader__subtitle]: subtitle,
        [classes.actionBarHeader__onlyTitle]: !subtitle,
        [classes.actionBarHeader__open]: open,
      })}
    >
      <div className={cn(classes.actionBarHeaderIcon)}>
        <ActionBarIcon />
      </div>
      <button
        className={cn(classes.actionBarHeaderTexts)}
        aria-expanded={open}
        type='button'
        onClick={onClick}
        id={headerId}
        aria-controls={contentId}
      >
        {title}
        {subtitle}
      </button>
      <div className={classes.actionBarHeaderCenterText}>{centerText}</div>
      <div className={cn(classes.actionBarHeaderActions)}>{actions}</div>
    </div>
  );
};
