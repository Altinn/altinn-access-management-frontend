/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import * as React from 'react';
import cn from 'classnames';
import { forwardRef } from 'react';
import { DsHeading, DsParagraph } from '@altinn/altinn-components';

import { useActionBarContext } from './Context';
import classes from './ActionBarHeader.module.css';
import { ActionBarIcon } from './ActionBarIcon';
import { ActionBarActions } from './ActionBarActions';
import type { ActionBarProps } from './ActionBar';

export type ActionBarHeaderProps = Pick<
  ActionBarProps,
  'title' | 'subtitle' | 'additionalText' | 'actions' | 'headingLevel'
>;

export const ActionBarHeader = forwardRef<HTMLHeadingElement, ActionBarHeaderProps>(
  ({ additionalText, subtitle, title, actions, headingLevel }, ref) => {
    const { open, toggleOpen, contentId, headerId, color, size } = useActionBarContext();

    let paragraphSize: 'sm' | 'md' | 'lg' | 'xs';
    let headingSize: 'sm' | 'md' | 'lg';
    switch (size) {
      case 'large':
        headingLevel = headingLevel || 3;
        paragraphSize = 'lg';
        headingSize = 'lg';
        break;
      case 'medium':
        headingLevel = headingLevel || 4;
        paragraphSize = 'sm';
        headingSize = 'md';
        break;
      case 'small':
        headingLevel = headingLevel || 5;
        paragraphSize = 'xs';
        headingSize = 'sm';
        break;
    }
    return (
      <DsHeading
        level={headingLevel}
        data-size={headingSize}
        ref={ref}
        className={cn(classes.actionBar, classes[color], classes[size], {
          [classes.subtitle]: subtitle,
          [classes.open]: open,
          [classes.clickable]: toggleOpen,
        })}
      >
        {toggleOpen ? (
          <button
            className={cn(classes.actionBarHeader, classes.clickable, classes[color])}
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
                <DsParagraph
                  className={classes.title}
                  data-size={paragraphSize}
                >
                  {title}
                </DsParagraph>
                {subtitle && (
                  <DsParagraph
                    data-size='xs'
                    className={classes.subtitle}
                  >
                    {subtitle}
                  </DsParagraph>
                )}
              </div>
            </div>
          </button>
        ) : (
          <div className={cn(classes.actionBarHeader)}>
            <div className={classes.actionBarTexts}>
              <DsParagraph
                data-size={paragraphSize}
                className={classes.title}
              >
                {title}
              </DsParagraph>
              {subtitle && (
                <DsParagraph
                  data-size='xs'
                  className={classes.subtitle}
                >
                  {subtitle}
                </DsParagraph>
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
            data-size='sm'
          >
            {additionalText}
          </button>
        )}
        {actions && (
          <div className={classes.actionBarActions}>
            <ActionBarActions>{actions}</ActionBarActions>
          </div>
        )}
      </DsHeading>
    );
  },
);

ActionBarHeader.displayName = 'ActionBarHeader';
