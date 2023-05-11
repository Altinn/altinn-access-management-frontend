/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import * as React from 'react';
import { useId } from 'react';
import cn from 'classnames';

import type { ClickHandler } from './Context';
import { ActionBarContext } from './Context';
import classes from './ActionBar.module.css';
import { ActionBarIcon } from './ActionBarIcon';
import { ActionBarActions } from './ActionBarActions';
import { ActionBarContent } from './ActionBarContent';

export interface ActionBarProps {
  actions?: React.ReactNode;
  additionalText?: React.ReactNode;
  children?: React.ReactNode;
  color?: 'light' | 'neutral' | 'warning' | 'success' | 'danger';
  onClick?: ClickHandler;
  open?: boolean;
  subtitle?: React.ReactNode;
  title?: React.ReactNode;
}

export const ActionBar = ({
  actions,
  additionalText,
  children,
  color = 'neutral',
  onClick,
  open = false,
  subtitle,
  title,
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
          color,
        }}
      >
        <div
          className={cn(classes.actionBar, classes[color], {
            [classes.subtitle]: subtitle,
            [classes.open]: open,
            [classes.clickable]: onClick,
          })}
          tabIndex={-1}
          onClick={onClick}
        >
          {children && (
            <div className={cn(classes.actionBarIcon)}>
              <ActionBarIcon />
            </div>
          )}
          {children ? (
            <button
              className={cn(classes.actionBarHeader, {
                [classes.clickable]: onClick,
              })}
              type='button'
              onClick={onClick}
              id={headerId}
              data-testid='action-bar'
              aria-expanded={open}
              aria-controls={contentId}
            >
              <div className={classes.actionBarTexts}>
                <div className={classes.title}>{title}</div>
                <div className={classes.subtitle}>{subtitle}</div>
              </div>
            </button>
          ) : (
            <button
              className={cn(classes.actionBarHeader, {
                [classes.clickable]: onClick,
              })}
              type='button'
              onClick={onClick}
              id={headerId}
              data-testid='action-bar'
              aria-controls={contentId}
            >
              <div className={classes.actionBarTexts}>
                <div className={classes.title}>{title}</div>
                <div className={classes.subtitle}>{subtitle}</div>
              </div>
            </button>
          )}
          {additionalText && (
            <button
              className={cn(classes.actionBarAdditionalText, {
                [classes.clickable]: onClick,
              })}
              onClick={onClick}
              tabIndex={-1}
            >
              {additionalText}
            </button>
          )}
          {actions && (
            <div className={classes.actionBarActions}>
              <ActionBarActions>{actions}</ActionBarActions>
            </div>
          )}
        </div>
        <ActionBarContent>{children}</ActionBarContent>
      </ActionBarContext.Provider>
    </>
  );
};

export default ActionBar;
