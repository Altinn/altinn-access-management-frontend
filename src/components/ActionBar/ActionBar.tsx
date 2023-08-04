/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import * as React from 'react';
import { useId } from 'react';
import cn from 'classnames';
import { Paragraph } from '@digdir/design-system-react';

import type { ClickHandler } from './Context';
import { ActionBarContext } from './Context';
import classes from './ActionBar.module.css';
import { ActionBarIcon } from './ActionBarIcon';
import { ActionBarActions } from './ActionBarActions';
import { ActionBarContent } from './ActionBarContent';

export interface ActionBarProps {
  /** Additional actions to be displayed on the right side of the ActionBar. */
  actions?: React.ReactNode;
  /** Additional text to be displayed on the right side of the header of the ActionBar. */
  additionalText?: React.ReactNode;
  /** The content to be displayed as expandable content inside the ActionBar. */
  children?: React.ReactNode;
  /** The color variant of the ActionBar. */
  color?: 'light' | 'dark' | 'neutral' | 'warning' | 'success' | 'danger';
  /** The size variant of the ActionBar. */
  size?: 'small' | 'medium' | 'large';
  /** The click event handler for the ActionBar. */
  onClick?: ClickHandler;
  /** Specifies whether the ActionBar is open or closed. */
  open?: boolean;
  /** The subtitle to be displayed in the header of the ActionBar. */
  subtitle?: React.ReactNode;
  /** The title to be displayed in the header of the ActionBar. */
  title?: React.ReactNode;
}

/**
 * @component
 * @example
 * <ActionBar
 *    actions={
 *      <><button onClick={handleActionBarClick}>Action 1</button>
 *      <button onClick={handleActionBarClick}>Action 1</button></>
 *    }
 *    additionalText=<div>"Additional Text"</div>
 *    color="neutral"
 *    onClick={handleActionBarClick}
 *    open={openState}
 *    subtitle={<div>"Subtitle"</div>}
 *    title={<div>"Title"</div>}
 *   >
 *      <div>Content goes here</div>
 * </ActionBar>
 *
 * @property {React.ReactNode} [actions] - Additional actions to be displayed on the right side of the header of the ActionBar.
 * @property {React.ReactNode} [additionalText] - Additional text to be displayed in the header of the ActionBar.
 * @property {React.ReactNode} [children] - The content to be displayed as expandable content inside the ActionBar.
 * @property {'light' | 'neutral' | 'warning' | 'success' | 'danger'} [color='neutral'] - The color variant of the ActionBar.
 * @property {ClickHandler} [onClick] - The click event handler for the ActionBar.
 * @property {boolean} [open=false] - Specifies whether the ActionBar is open or closed.
 * @property {React.ReactNode} [subtitle] - The subtitle to be displayed in the header of the ActionBar.
 * @property {React.ReactNode} [title] - The title to be displayed in the header of the ActionBar.
 * @returns {React.ReactNode} The rendered ActionBar component.
 */

export const ActionBar = ({
  actions,
  additionalText,
  children,
  color = 'neutral',
  size = 'medium',
  onClick,
  open = false,
  subtitle,
  title,
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
          color,
          size,
        }}
      >
        <div
          className={cn(classes.actionBar, classes[color], classes[size], {
            [classes.subtitle]: subtitle,
            [classes.open]: open,
            [classes.clickable]: onClick,
          })}
          onClick={onClick}
        >
          {onClick ? (
            <button
              className={cn(classes.actionBarHeader, classes.clickable, classes[color])}
              type='button'
              onClick={onClick}
              id={headerId}
              data-testid='action-bar'
              aria-expanded={open ?? undefined}
              aria-controls={children ? contentId : undefined}
            >
              <div className={classes.actionBarButtonContainer}>
                {children && (
                  <div className={cn(classes.actionBarIcon, classes[size], classes[color])}>
                    <ActionBarIcon />
                  </div>
                )}
                <div className={classes.actionBarTexts}>
                  <Paragraph
                    as='div'
                    size={size}
                    className={classes.title}
                  >
                    {title}
                  </Paragraph>
                  {subtitle && (
                    <Paragraph
                      as='div'
                      size='xsmall'
                      className={classes.subtitle}
                    >
                      {subtitle}
                    </Paragraph>
                  )}
                </div>
              </div>
            </button>
          ) : (
            <div
              className={cn(classes.actionBarHeader)}
              id={headerId}
              data-testid='action-bar'
            >
              <div className={classes.actionBarTexts}>
                <Paragraph
                  as='div'
                  size={size}
                  className={classes.title}
                >
                  {title}
                </Paragraph>
                {subtitle && (
                  <Paragraph
                    as='div'
                    size='xsmall'
                    className={classes.subtitle}
                  >
                    {subtitle}
                  </Paragraph>
                )}
              </div>
            </div>
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
    </div>
  );
};

export default ActionBar;
