import * as React from 'react';
import cn from 'classnames';
import { ChevronDownIcon as Chevron } from '@navikt/aksel-icons';

import { ReactComponent as CircleArrow } from '@/assets/CircleArrow.svg';

import classes from './ActionBarIcon.module.css';
import { useActionBarContext } from './Context';

export const ActionBarIcon = () => {
  const { onClick, open, iconVariant } = useActionBarContext();
  const iconClassnames = [
    classes[`actionBar-icon`],
    {
      [classes['actionBarIcon--opened']]: open,
    },
  ];
  const props = {
    height: 30,
    width: 30,
    className: cn(iconClassnames),
    'data-testid': 'action-bar-icon',
    onClick,
  };

  switch (iconVariant) {
    case 'primary':
      return <Chevron {...props} />;
    case 'secondary':
      return <CircleArrow {...props} />;
  }
};

export default ActionBarIcon;
