import Lottie from 'lottie-react';
import { Spinner } from '@digdir/designsystemet-react';
import { t } from 'i18next';

import checkMarkAnimation from '@/assets/AltinnCheckmarkAnimation.json';

import classes from './LoadingAnimation.module.css';

export const LoadingAnimation = ({
  isLoading,
  displaySuccess = false,
}: {
  isLoading: boolean;
  displaySuccess: boolean;
}) => {
  if (isLoading) {
    return (
      <div className={classes.loadingSection}>
        <Spinner
          data-size='lg'
          aria-label={t('common.loading')}
        />
      </div>
    );
  }

  if (displaySuccess) {
    return (
      <div className={classes.loadingSection}>
        <Lottie
          animationData={checkMarkAnimation}
          loop={false}
          className={classes.checkmarkAnimation}
          aria-label={t('common.success')}
        />
      </div>
    );
  }

  return null;
};
