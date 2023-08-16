import { Button, Spinner } from '@digdir/design-system-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import classes from './NavigationButtons.module.css';

export interface NavigationButtonsProps {
  previousText: string;
  previousPath: string;
  nextText: string;
  nextPath: string;
  nextDisabled: boolean;
  nextLoading?: boolean;
  nextButtonColor?: 'primary' | 'success';
  nextButtonClick?: () => void;
}

export const NavigationButtons = ({
  previousText,
  previousPath,
  nextText,
  nextDisabled,
  nextPath,
  nextLoading,
  nextButtonColor = 'primary',
  nextButtonClick,
}: NavigationButtonsProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const handleNextOnClick = () => {
    if (nextButtonClick) {
      nextButtonClick();
    } else {
      navigate(nextPath);
    }
  };

  return (
    <div className={classes.navButtonContainer}>
      <div className={classes.navButtonLeft}>
        <Button
          color='primary'
          variant='outline'
          fullWidth={true}
          onClick={() => {
            navigate(previousPath);
          }}
        >
          {previousText}
        </Button>
      </div>
      <div className={classes.navButtonRight}>
        <Button
          color={nextButtonColor}
          variant='filled'
          fullWidth={true}
          onClick={handleNextOnClick}
          disabled={nextDisabled}
        >
          {nextLoading && (
            <Spinner
              title={String(t('common.loading'))}
              size='small'
              variant='interaction'
            />
          )}
          {nextText}
        </Button>
      </div>
    </div>
  );
};
