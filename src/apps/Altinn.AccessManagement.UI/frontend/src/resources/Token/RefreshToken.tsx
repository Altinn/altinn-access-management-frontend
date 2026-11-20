import * as React from 'react';

import { refreshToken } from './tokenUtils';

export const RefreshToken = () => {
  const lastRefreshTokenTimestamp = React.useRef(0);
  const TEN_MINUTES_IN_MILLISECONDS = 600000;

  function refreshJwtToken() {
    const timeNow = Date.now();

    if (timeNow - lastRefreshTokenTimestamp.current > TEN_MINUTES_IN_MILLISECONDS) {
      lastRefreshTokenTimestamp.current = timeNow;
      refreshToken();
    }
  }

  React.useEffect(() => {
    const setUpEventListeners = () => {
      window.addEventListener('mousemove', refreshJwtToken);
      window.addEventListener('scroll', refreshJwtToken);
      window.addEventListener('onfocus', refreshJwtToken);
      window.addEventListener('keydown', refreshJwtToken);
    };
    refreshJwtToken();
    setUpEventListeners();
    return () => {
      window.removeEventListener('mousemove', refreshJwtToken);
      window.removeEventListener('scroll', refreshJwtToken);
      window.removeEventListener('onfocus', refreshJwtToken);
      window.removeEventListener('keydown', refreshJwtToken);
    };
  }, []);
};
