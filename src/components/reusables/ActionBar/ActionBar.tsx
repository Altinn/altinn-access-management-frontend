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
            [classes.actionBarHeader__expandable]: children,
            [classes[`actionBarHeader__${color}__expandable`]]: children,
          })}
          onClick={onClick}
          tabIndex={-1}
        >
          {children && (
            <div className={cn(classes.actionBarHeaderIcon)}>
              <ActionBarIcon />
            </div>
          )}
          {children ? (
            <button
              className={cn(
                classes.actionBarHeaderButton,
                classes.actionBarHeaderButton__expandable,
              )}
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
              className={cn(classes.actionBarHeaderButton)}
              type='button'
              onClick={onClick}
              id={headerId}
            >
              <div>{title}</div>
              <div className={classes.actionBarSubtitle}>{subtitle}</div>
            </button>
          )}
          <button
            className={cn(classes.actionBarHeaderCenterText, {
              [classes.actionBarHeaderCenterText__expandable]: children,
            })}
            onClick={onClick}
            tabIndex={-1}
          >
            {additionalText}
          </button>
          {actions && (
            <div
              className={cn(classes.actionBarHeaderActions, {
                [classes.actionBarHeaderActions__expandable]: children,
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
