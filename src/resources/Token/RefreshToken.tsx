/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-misused-promises */
import axios from 'axios';
import * as React from 'react';

export const RefreshToken = () => {
  const lastRefreshTokenTimestamp = React.useRef(0);
  const TEN_MINUTES_IN_MILLISECONDS = 600000;

  async function refreshJwtToken() {
    const timeNow = Date.now();

    if (timeNow - lastRefreshTokenTimestamp.current > TEN_MINUTES_IN_MILLISECONDS) {
      lastRefreshTokenTimestamp.current = timeNow;
      const instance = axios.create({
        baseURL: '../../../',
      });

      return await instance
        .get('accessmanagement/api/v1/authentication/refresh')
        .then((response) => response.data)
        .catch((refreshError) => {
          // Most likely due to expired token so we redirect to login
          try {
            window.location.href = getEnvironmentLoginUrl();
          } catch (error) {
            console.error(refreshError, error);
          }
        });
    }
  }

  const getEnvironmentLoginUrl = () => {
    // Split on dots. We expect the format to be https://am.ui.{env}.altinn{.cloud?}/etc/etc
    const domainSplitted: string[] = window.location.host.split('.');
    let encodedGoToUrl = '';
    if (domainSplitted.length === 5) {
      encodedGoToUrl = encodeURIComponent(
        `https://${domainSplitted[2]}.${domainSplitted[3]}.${domainSplitted[4]}/ui/Profile`,
      ); // Return user to Profile after login
      return (
        `https://platform.${domainSplitted[2]}.${domainSplitted[3]}.${domainSplitted[4]}` +
        `/authentication/api/v1/authentication?goto=${encodedGoToUrl}`
      );
    }
    if (domainSplitted.length === 4) {
      encodedGoToUrl = encodeURIComponent(
        `https://${domainSplitted[2]}.${domainSplitted[3]}/ui/Profile`,
      ); // Return user to Profile after login
      return (
        `https://platform.${domainSplitted[2]}.${domainSplitted[3]}` +
        `/authentication/api/v1/authentication?goto=${encodedGoToUrl}`
      );
    }
    throw new Error('Unknown domain');
  };

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
