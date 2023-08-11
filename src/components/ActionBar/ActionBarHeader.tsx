/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import * as React from 'react';
import cn from 'classnames';
import { forwardRef } from 'react';
import { Paragraph } from '@digdir/design-system-react';

import { useActionBarContext } from './Context';
import classes from './ActionBarHeader.module.css';
import { ActionBarIcon } from './ActionBarIcon';
import { ActionBarActions } from './ActionBarActions';

export interface ActionBarHeaderProps {
  /** Additional actions to be displayed on the right side of the ActionBar. */
  actions?: React.ReactNode;
  /** Additional text to be displayed on the right side of the header of the ActionBar. */
  additionalText?: React.ReactNode;
  /** Heading level. Use this to make sure the heading is correct according to you page heading levels */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** The subtitle to be displayed in the header of the ActionBar. */
  subtitle?: React.ReactNode;
  /** The title to be displayed in the header of the ActionBar. */
  title?: React.ReactNode;
}

export const ActionBarHeader = forwardRef<HTMLHeadingElement, ActionBarHeaderProps>(
  ({ additionalText, headingLevel, subtitle, title, actions }, ref) => {
    const { open, toggleOpen, contentId, headerId, color, size } = useActionBarContext();

    let renderAsElem: React.ElementType;
    switch (size) {
      case 'large':
        renderAsElem = headingLevel ? `h${headingLevel}` : 'h3';
        break;
      case 'medium':
        renderAsElem = headingLevel ? `h${headingLevel}` : 'h4';
        break;
      case 'small':
        renderAsElem = headingLevel ? `h${headingLevel}` : 'h5';
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
                  as={renderAsElem}
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
                as={renderAsElem}
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
