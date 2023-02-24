import { Button, ButtonColor, ButtonSize, ButtonVariant } from '@digdir/design-system-react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import classes from './NavigationButtons.module.css';

export interface NavigationButtonsProps {
  previousText: string;
  previousPath: string;
  nextText: string;
  nextPath: string;
  nextDisabled: boolean;
}

export const NavigationButtons = ({
  previousText,
  nextText,
  nextDisabled,
  previousPath,
  nextPath,
}: NavigationButtonsProps) => {
  const navigate = useNavigate();

  return (
    <div className={classes.navButtonContainer}>
      <div className={classes.navButtonLeft}>
        <Button
          color={ButtonColor.Primary}
          variant={ButtonVariant.Outline}
          size={ButtonSize.Small}
          fullWidth={true}
          onClick={() => navigate(previousPath)}
        >
          {previousText}
        </Button>
      </div>
      <div className={classes.navButtonRight}>
        <Button
          color={ButtonColor.Primary}
          variant={ButtonVariant.Filled}
          size={ButtonSize.Small}
          fullWidth={true}
          onClick={() => navigate(nextPath)}
          disabled={nextDisabled}
        >
          {nextText}
        </Button>
      </div>
    </div>
  );
};
