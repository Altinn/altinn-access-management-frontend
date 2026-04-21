import { useCallback } from 'react';

export const useAutoFocusRef = <T extends HTMLElement = HTMLElement>() => {
  return useCallback((node: T | null) => {
    node?.focus();
  }, []);
};
