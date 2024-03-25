/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import * as React from 'react';
import cn from 'classnames';
import { forwardRef } from 'react';
import { Paragraph } from '@digdir/designsystemet-react';

import { useActionBarContext } from './Context';
import classes from './ActionBarHeader.module.css';
import { ActionBarIcon } from './ActionBarIcon';
import { ActionBarActions } from './ActionBarActions';
import { type ActionBarProps } from './ActionBar';

export type ActionBarHeaderProps = Pick<
  ActionBarProps,
  'headingLevel' | 'title' | 'subtitle' | 'additionalText' | 'actions'
>;

export const ActionBarHeader = forwardRef<HTMLHeadingElement, ActionBarHeaderProps>(
  ({ additionalText, subtitle, title, actions }, ref) => {
    const { open, toggleOpen, contentId, headerId, color, size } = useActionBarContext();

    let headingSize: 'small' | 'medium' | 'large' | 'xsmall';
    switch (size) {
      case 'large':
        headingSize = 'large';
        break;
      case 'medium':
        headingSize = 'small';
        break;
      case 'small':
        headingSize = 'xsmall';
        break;
    }

    return (
      <div
        className={cn(classes.actionBar, classes[color], classes[size], {
          [classes.subtitle]: subtitle,
          [classes.open]: open,
          [classes.clickable]: toggleOpen,
        })}
        ref={ref}
      >
        {toggleOpen ? (
          <button
            className={cn(classes.actionBarHeader, classes.clickable, classes[color])}
            type='button'
            onClick={toggleOpen}
            id={headerId}
            data-testid='action-bar'
            aria-expanded={open}
            aria-controls={contentId}
          >
            <div className={classes.actionBarButtonContainer}>
              <div className={cn(classes.actionBarIcon, classes[size])}>
                <ActionBarIcon />
              </div>
              <div className={classes.actionBarTexts}>
                <Paragraph
                  size={headingSize}
                  className={classes.title}
                >
                  {title}
                </Paragraph>
                {subtitle && (
                  <Paragraph
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
                size={headingSize}
                className={classes.title}
              >
                {title}
              </Paragraph>
              {subtitle && (
                <Paragraph
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
              [classes.clickable]: toggleOpen,
            })}
            onClick={toggleOpen}
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
    );
  },
);

ActionBarHeader.displayName = 'ActionBarHeader';
