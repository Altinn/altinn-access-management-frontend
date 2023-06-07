import * as React from 'react';
import cn from 'classnames';
import { ChevronDownIcon as Chevron } from '@navikt/aksel-icons';

import classes from './ActionBarIcon.module.css';
import { useActionBarContext } from './Context';

export const ActionBarIcon = () => {
  const { onClick, open } = useActionBarContext();
  const iconClassnames = [
    classes.actionBarIcon,
    {
      [classes.open]: open,
    },
  ];
  const props = {
    height: 30,
    width: 30,
    className: cn(iconClassnames),
    'data-testid': 'action-bar-icon',
    onClick,
    altText: 'chevron',
  };

  return <Chevron {...props} />;
};
