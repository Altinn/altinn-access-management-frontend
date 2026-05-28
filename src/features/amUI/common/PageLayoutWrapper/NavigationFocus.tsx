import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import classes from './NavigationFocus.module.css';

export const NavigationFocus = () => {
  const { pathname } = useLocation();
  const skipRef = useRef<HTMLDivElement | null>(null);
  const [title, setTitle] = useState('');

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      setTitle(document.title);
    });
    return () => cancelAnimationFrame(rafId);
  }, [pathname]);

  useEffect(() => {
    if (title) {
      skipRef.current?.focus({ preventScroll: true });
    }
  }, [title]);

  return (
    <div
      className={classes.srOnly}
      tabIndex={-1}
      ref={skipRef}
    >
      {title}
    </div>
  );
};
