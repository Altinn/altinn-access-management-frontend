/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-misused-promises */
import axios from 'axios';
import * as React from 'react';

export const RefreshToken = () => {
  const lastRefreshTokenTimestamp = React.useRef(0);
  const TEN_MINUTES_IN_MILLISECONDS = 600000;

  async function refreshJwtToken() {
    const timeNow = Date.now();
    console.log('timeNow', timeNow - lastRefreshTokenTimestamp.current);
    console.log(
      'result',
      timeNow - lastRefreshTokenTimestamp.current > TEN_MINUTES_IN_MILLISECONDS,
    );

    if (timeNow - lastRefreshTokenTimestamp.current > TEN_MINUTES_IN_MILLISECONDS) {
      lastRefreshTokenTimestamp.current = timeNow;
      return await axios
        // TODO: This may fail in AT if axios doesn't automatically change the base url
        .get('accessmanagement/api/v1/authentication/refresh')
        .then((response) => response.data)
        .catch((error) => {
          !import.meta.env.DEV && (window.location.pathname = '/');
          console.error(error);
        });
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
  });
};
