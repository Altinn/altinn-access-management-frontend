/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import * as React from 'react';
import cn from 'classnames';

import classes from './ActionBarHeader.module.css';
import { useActionBarContext } from './Context';
import { ActionBarIcon } from './ActionBarIcon';
import { ActionBarContent } from './ActionBarContent';

export interface ActionBarHeaderProps {
  children?: React.ReactNode;
  title?: React.ReactNode;
  actions?: React.ReactNode;
  subtitle?: React.ReactNode;
  additionalText?: React.ReactNode;
}

export const ActionBarHeader = ({
  children,
  title,
  actions,
  subtitle,
  additionalText,
}: ActionBarHeaderProps) => {
  const { onClick, open, headerId, contentId, color } = useActionBarContext();

  return (
    <div>
      <div
        className={cn(classes.actionBarHeader, classes[`actionBarHeader__${color}`], {
          [classes.actionBarHeader__subtitle]: subtitle,
          [classes.actionBarHeader__onlyTitle]: !subtitle,
          [classes.actionBarHeader__open]: open,
        })}
      >
        {children && (
          <div className={cn(classes.actionBarHeaderIcon)}>
            <ActionBarIcon />
          </div>
        )}
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
        <button
          className={classes.actionBarHeaderCenterText}
          onClick={onClick}
          tabIndex={-1}
        >
          {additionalText}
        </button>
        {actions && <div className={cn(classes.actionBarHeaderActions)}>{actions}</div>}
      </div>
      <ActionBarContent>{children}</ActionBarContent>
    </div>
  );
};
