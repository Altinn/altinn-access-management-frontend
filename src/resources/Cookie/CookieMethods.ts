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

export const useCookieListener = (cookieName: string, interval = 2000) => {
  const [cookie, setCookie] = useState(getCookie(cookieName));
  const [displayAlert, setDisplayAlert] = useState(false);

  useEffect(() => {
    const checkCookie = setInterval(() => {
      const currentCookie = getCookie(cookieName);
      if (currentCookie !== cookie) {
        setCookie(currentCookie);
        setDisplayAlert(true);
      }
    }, interval); // Check every interval

    return () => clearInterval(checkCookie);
  }, [cookie, cookieName]);

  return displayAlert;
};
