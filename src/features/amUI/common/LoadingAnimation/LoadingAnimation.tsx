import { useRef } from 'react';
import { Lottie, type LottieHandle } from 'lottie-react';
import { t } from 'i18next';
import { DsSpinner } from '@altinn/altinn-components';

import checkMarkAnimation from '@/assets/AltinnCheckmarkAnimation.json';

import classes from './LoadingAnimation.module.css';

const SUCCESS_SEGMENT = [0, 70] as const;

export const LoadingAnimation = ({
  isLoading,
  displaySuccess = false,
  onAnimationEnd = undefined,
}: {
  isLoading: boolean;
  displaySuccess: boolean;
  onAnimationEnd?: () => void;
}) => {
  const lottieRef = useRef<LottieHandle>(null);

  // lottie-react won't autoplay when the device asks for reduced motion, so the animation would
  // never complete. Show the finished checkmark instead and report the end straight away.
  const onReady = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      lottieRef.current?.seek({ percent: 100 });
      onAnimationEnd?.();
    }
  };

  if (isLoading) {
    return (
      <div
        className={classes.loadingSection}
        aria-live='polite'
      >
        <DsSpinner
          data-size='xl'
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
          src={checkMarkAnimation}
          autoplay
          loop={false}
          segment={onAnimationEnd ? SUCCESS_SEGMENT : undefined}
          lottieRef={lottieRef}
          subscriptions={{ ready: onReady, complete: onAnimationEnd }}
          className={classes.checkmarkAnimation}
          aria-label={t('common.success')}
        />
      </div>
    );
  }

  return null;
};
