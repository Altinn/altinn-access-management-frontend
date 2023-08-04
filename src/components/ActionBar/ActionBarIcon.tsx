import * as React from 'react';
import cn from 'classnames';
import { ChevronDownIcon as Chevron, ChevronDownCircleFillIcon } from '@navikt/aksel-icons';

import classes from './ActionBarIcon.module.css';
import { useActionBarContext } from './Context';

export const ActionBarIcon = () => {
  const { onClick, open, size } = useActionBarContext();
  const iconClassnames = [
    classes.actionBarIcon,
    {
      [classes.open]: open,
    },
  ];
  const props = {
    height: 30,
    width: 30,
    className: cn(iconClassnames, classes[size]),
    'data-testid': 'action-bar-icon',
    onClick,
  };

  const isLarge = size === 'large';

  return (
    <>
      {isLarge ? (
        <ChevronDownCircleFillIcon
          {...props}
          aria-hidden
        />
      ) : (
        <Chevron
          {...props}
          aria-hidden
        />
      )}
    </>
  );
};
