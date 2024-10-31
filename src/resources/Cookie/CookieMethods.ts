import { useState, useEffect } from 'react';

export function getCookie(cname: string) {
  const name = cname + '=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

/**
 * Detects changes in a given cookie by polling it with the given interval
 * @param cookieName The name of the cookie to be checked
 * @param interval The interval in which to poll the cookie (given in milliseconds)
 * @returns `true` if the cookie has been changed from it's original value, `false` otherwise.
 */
export const useCookieListener = (cookieName: string, interval = 2000) => {
  const [cookieValue, setCookieValue] = useState(getCookie(cookieName));
  const [cookieChanged, setCookieChanged] = useState(false);

  useEffect(() => {
    const checkCookie = setInterval(() => {
      const currentCookie = getCookie(cookieName);
      if (currentCookie !== cookieValue) {
        setCookieValue(currentCookie);
        setCookieChanged(true);
      }
    }, interval); // Check every interval

    return () => clearInterval(checkCookie);
  }, [cookieName, interval]);

  return cookieChanged;
};
