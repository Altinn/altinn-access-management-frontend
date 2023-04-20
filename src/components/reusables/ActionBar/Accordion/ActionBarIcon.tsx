import * as React from 'react';
import cn from 'classnames';
import { ChevronRightIcon as Arrow } from '@navikt/aksel-icons';

import classes from './ActionBarIcon.module.css';
import { useActionBarContext, ActionBarIconVariant } from './Context';
import { ReactComponent as CircleArrow } from './CircleArrow.svg';

export const ActionBarIcon = () => {
  const { onClick, open, iconVariant } = useActionBarContext();
  const iconClassnames = [
    classes[`accordion-icon`],
    {
      [classes['accordion-icon--opened']]: open,
    },
  ];
  const props = {
    height: 20,
    width: 20,
    className: cn(iconClassnames),
    'data-testid': iconVariant,
    onClick,
  };

  switch (iconVariant) {
    case ActionBarIconVariant.Primary:
      return <Arrow {...props} />;
    case ActionBarIconVariant.Secondary:
      return <CircleArrow {...props} />;
  }
};

export default ActionBarIcon;
