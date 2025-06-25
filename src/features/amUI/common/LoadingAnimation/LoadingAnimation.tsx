import Lottie from 'lottie-react';
import { t } from 'i18next';
import { DsSpinner } from '@altinn/altinn-components';

import checkMarkAnimation from '@/assets/AltinnCheckmarkAnimation.json';

import classes from './LoadingAnimation.module.css';

export const LoadingAnimation = ({
  isLoading,
  displaySuccess = false,
  onAnimationEnd = undefined,
}: {
  isLoading: boolean;
  displaySuccess: boolean;
  onAnimationEnd?: () => void;
}) => {
  if (isLoading) {
    return (
      <div
        className={classes.loadingSection}
        aria-live='polite'
      >
        <DsSpinner
          data-size='lg'
          aria-label={t('common.loading')}
        />
      </div>
    );
  }

  if (displaySuccess) {
    return (
      <div
        className={classes.loadingSection}
        aria-live='assertive'
      >
        <Lottie
          animationData={checkMarkAnimation}
          loop={false}
          className={classes.checkmarkAnimation}
          aria-label={t('common.success')}
          onAnimationEnd={onAnimationEnd}
          onComplete={onAnimationEnd}
          initialSegment={onAnimationEnd ? [0, 70] : undefined}
        />
      </div>
    );
  }

  return null;
};
