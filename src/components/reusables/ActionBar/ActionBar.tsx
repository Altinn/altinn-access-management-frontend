import * as React from 'react';
import { useId } from 'react';
import cn from 'classnames';

import type { ClickHandler } from './Context';
import { ActionBarContext } from './Context';
import classes from './ActionBar.module.css';
import { ActionBarIcon } from './ActionBarIcon';
import { ActionBarContent } from './ActionBarContent';

export interface ActionBarProps {
  actions?: React.ReactNode;
  additionalText?: React.ReactNode;
  children?: React.ReactNode;
  color?: 'light' | 'neutral' | 'warning' | 'success' | 'danger';
  iconVariant?: 'primary' | 'secondary';
  onClick?: ClickHandler;
  open?: boolean;
  subtitle?: React.ReactNode;
  title?: React.ReactNode;
}

export const ActionBar = ({
  children,
  open = false,
  onClick,
  iconVariant = 'primary',
  color = 'light',
  title,
  actions,
  subtitle,
  additionalText,
}: ActionBarProps) => {
  const headerId = useId();
  const contentId = useId();
  return (
    <>
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
          {children ? (
            <button
              className={cn(classes.actionBarHeaderTexts)}
              aria-expanded={open}
              type='button'
              onClick={onClick}
              id={headerId}
              aria-controls={contentId}
            >
              <div className={classes.actionBarTitle}>{title}</div>
              <div className={classes.actionBarSubtitle}>{subtitle}</div>
            </button>
          ) : (
            <button
              className={cn(classes.actionBarHeaderTexts)}
              type='button'
              onClick={onClick}
              id={headerId}
            >
              {title}
              {subtitle}
            </button>
          )}
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
    </>
  );
};

export default ActionBar;
