import * as React from 'react';
import cn from 'classnames';

import classes from './ActionBarHeader.module.css';
import { useActionBarContext } from './Context';
import { ActionBarIcon } from './ActionBarIcon';

export interface ActionBarHeaderProps {
  children?: React.ReactNode;
  actions?: React.ReactNode;
  subtitle?: string;
}

export const ActionBarHeader = ({ children, actions, subtitle }: ActionBarHeaderProps) => {
  const { onClick, open, headerId, contentId } = useActionBarContext();

  return (
    <div
      className={cn(classes['accordion-header'], {
        [classes['accordion-header--subtitle']]: subtitle,
      })}
    >
      <ActionBarIcon />
      <button
        className={cn(classes['accordion-header__title'])}
        aria-expanded={open}
        type='button'
        onClick={onClick}
        id={headerId}
        aria-controls={contentId}
      >
        {children}
        {subtitle?.length && (
          <div
            data-testid='accordion-header-subtitle'
            className={cn(classes['accordion-header__subtitle'])}
          >
            {subtitle}
          </div>
        )}
      </button>
      <div className={cn(classes['accordion-header__actions'])}>{actions}</div>
    </div>
  );
};
