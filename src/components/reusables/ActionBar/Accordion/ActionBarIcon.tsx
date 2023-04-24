import * as React from 'react';
import cn from 'classnames';
import { ChevronDownIcon as Chevron } from '@navikt/aksel-icons';

import { ReactComponent as CircleArrow } from '@/assets/CircleArrow.svg';

import classes from './ActionBarIcon.module.css';
import { useActionBarContext, ActionBarIconVariant } from './Context';

export const ActionBarIcon = () => {
  const { onClick, open, iconVariant } = useActionBarContext();
  const iconClassnames = [
    classes[`actionBar-icon`],
    {
      [classes['actionBarIcon--opened']]: open,
    },
  ];
  const props = {
    height: 23.53,
    width: 26.35,
    className: cn(iconClassnames),
    'data-testid': iconVariant,
    onClick,
  };

  switch (iconVariant) {
    case ActionBarIconVariant.Primary:
      return <Chevron {...props} />;
    case ActionBarIconVariant.Secondary:
      return <CircleArrow {...props} />;
  }
};

export default ActionBarIcon;
