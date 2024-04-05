/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import * as React from 'react';
import cn from 'classnames';
import { forwardRef } from 'react';
import { Heading, Paragraph } from '@digdir/designsystemet-react';

import { useActionBarContext } from './Context';
import classes from './ActionBarHeader.module.css';
import { ActionBarIcon } from './ActionBarIcon';
import { ActionBarActions } from './ActionBarActions';
import { type ActionBarProps } from './ActionBar';

export type ActionBarHeaderProps = Pick<
  ActionBarProps,
  'title' | 'subtitle' | 'additionalText' | 'actions' | 'headingLevel'
>;

export const ActionBarHeader = forwardRef<HTMLHeadingElement, ActionBarHeaderProps>(
  ({ additionalText, subtitle, title, actions, headingLevel }, ref) => {
    const { open, toggleOpen, contentId, headerId, color, size } = useActionBarContext();

    let paragraphSize: 'small' | 'medium' | 'large' | 'xsmall';
    switch (size) {
      case 'large':
        headingLevel = headingLevel || 3;
        paragraphSize = 'large';
        break;
      case 'medium':
        headingLevel = headingLevel || 4;
        paragraphSize = 'small';
        break;
      case 'small':
        headingLevel = headingLevel || 5;
        paragraphSize = 'xsmall';
        break;
    }

    return (
      <Heading
        level={headingLevel}
        size={size}
        ref={ref}
        id={headerId}
        className={cn(classes.actionBar, classes[color], classes[size], {
          [classes.subtitle]: subtitle,
          [classes.open]: open,
          [classes.clickable]: toggleOpen,
        })}
      >
        {toggleOpen ? (
          <button
            className={cn(classes.actionBarHeader, classes.clickable, classes[color])}
            type='button'
            onClick={toggleOpen}
            id={headerId}
            aria-expanded={open}
            aria-controls={contentId}
            data-testid='action-bar'
          >
            <div className={classes.actionBarButtonContainer}>
              <div className={cn(classes.actionBarIcon, classes[size])}>
                <ActionBarIcon />
              </div>
              <div className={classes.actionBarTexts}>
                <Paragraph
                  className={classes.title}
                  size={paragraphSize}
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
          <div className={cn(classes.actionBarHeader)}>
            <div className={classes.actionBarTexts}>
              <Paragraph
                size={paragraphSize}
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
      </Heading>
    );
  },
);

ActionBarHeader.displayName = 'ActionBarHeader';
