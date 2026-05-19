import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import classes from './NavigationFocus.module.css';

export const NavigationFocus = () => {
  const { pathname } = useLocation();
  const skipRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (skipRef.current) {
      requestAnimationFrame(() => {
        if (skipRef.current) {
          skipRef.current.textContent = document.title;
          skipRef.current.focus();
        }
      });
    }
  }, [pathname]);

  return (
    <div
      className={classes.srOnly}
      tabIndex={-1}
      ref={skipRef as React.RefObject<HTMLDivElement>}
    />
  );
};
