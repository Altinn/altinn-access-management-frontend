import * as React from 'react';
import axios from 'axios';

import { RouterPath } from './routes/Router';

export const App = () => {
  console.log('test1');
  const lastRefreshTokenTimestamp = React.useRef(0);
  const TEN_MINUTE_IN_MILLISECONDS = 10; /* 600000 */

  async function refreshJwtToken() {
    return await axios
      // TODO: This may fail in AT if axios doesn't automatically change the base url
      .get('accessmanagement/api/v1/authentication/refresh')
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
        window.location.href(RouterPath.StartPage);
      });
  }

  React.useEffect(() => {
    const timeNow = Date.now();
    if (timeNow - lastRefreshTokenTimestamp.current > TEN_MINUTE_IN_MILLISECONDS) {
      lastRefreshTokenTimestamp.current = timeNow;
      console.log('test');

      const setUpEventListeners = () => {
        window.addEventListener('mousemove', refreshJwtToken);
        window.addEventListener('scroll', refreshJwtToken);
        window.addEventListener('onfocus', refreshJwtToken);
        window.addEventListener('keydown', refreshJwtToken);
      };

      const removeEventListeners = () => {
        window.removeEventListener('mousemove', refreshJwtToken);
        window.removeEventListener('scroll', refreshJwtToken);
        window.removeEventListener('onfocus', refreshJwtToken);
        window.removeEventListener('keydown', refreshJwtToken);
      };

      await refreshJwtToken();
    }
  });
};
