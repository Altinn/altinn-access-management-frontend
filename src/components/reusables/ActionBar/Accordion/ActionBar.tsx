import * as React from 'react';
import { useId } from 'react';
import cn from 'classnames';

import type { ClickHandler } from './Context';
import { ActionBarIconVariant, ActionBarContext } from './Context';
import classes from './ActionBar.module.css';
import { ActionBarIcon } from './ActionBarIcon';
import { ActionBarContent } from './ActionBarContent';

export interface ActionBarProps {
  actions?: React.ReactNode;
  additionalText?: React.ReactNode;
  children?: React.ReactNode;
  color?: 'light' | 'neutral' | 'warning' | 'success' | 'danger';
  iconVariant?: ActionBarIconVariant;
  onClick: ClickHandler;
  open: boolean;
  subtitle?: React.ReactNode;
  title?: React.ReactNode;
}

export const ActionBar = ({
  children,
  open,
  onClick,
  iconVariant = ActionBarIconVariant.Primary,
  color = 'light',
  title,
  actions,
  subtitle,
  additionalText,
}: ActionBarProps) => {
  const headerId = useId();
  const contentId = useId();
  return (
    <div>
      <ActionBarContext.Provider
        value={{
          onClick,
          open,
          headerId,
          contentId,
          iconVariant,
          color,
        }}
      >
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
      </ActionBarContext.Provider>
    </div>
  );
};

export default ActionBar;
