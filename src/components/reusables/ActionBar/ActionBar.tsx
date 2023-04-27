/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
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
  actions,
  additionalText,
  children,
  color = 'light',
  iconVariant = 'primary',
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
          iconVariant,
          color,
        }}
      >
        <div
          className={cn(classes.actionBar, classes[`actionBar__${color}`], {
            [classes.actionBar__subtitle]: subtitle,
            [classes.actionBar__onlyTitle]: !subtitle,
            [classes.actionBar__open]: open,
            [classes.actionBar__expandable]: children,
            [classes[`actionBar__${color}__expandable`]]: children,
          })}
          onClick={onClick}
          tabIndex={-1}
          data-testid='action-bar'
        >
          {children && (
            <div className={cn(classes.actionBarIcon)}>
              <ActionBarIcon />
            </div>
          )}
          {children ? (
            <button
              className={cn(classes.actionBarButton, classes.actionBarButton__expandable)}
              aria-expanded={open}
              type='button'
              onClick={onClick}
              id={headerId}
              aria-controls={contentId}
            >
              <div>{title}</div>
              <div className={classes.actionBarSubtitle}>{subtitle}</div>
            </button>
          ) : (
            <button
              className={cn(classes.actionBarButton)}
              type='button'
              onClick={onClick}
              id={headerId}
            >
              <div>{title}</div>
              <div className={classes.actionBarSubtitle}>{subtitle}</div>
            </button>
          )}
          <button
            className={cn(classes.actionBarCenterText, {
              [classes.actionBarCenterText__expandable]: children,
            })}
            onClick={onClick}
            tabIndex={-1}
          >
            {additionalText}
          </button>
          {actions && (
            <div
              className={cn(classes.actionBarActions, {
                [classes.actionBarActions__expandable]: children,
              })}
            >
              {actions}
            </div>
          )}
        </div>
        <ActionBarContent>{children}</ActionBarContent>
      </ActionBarContext.Provider>
    </>
  );
};

export default ActionBar;
