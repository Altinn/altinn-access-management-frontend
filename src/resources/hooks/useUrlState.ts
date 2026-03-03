import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

/**
 * A useState-like hook that persists state in URL search params.
 * State is automatically restored when navigating back to the page.
 *
 * Supports string and string[] values.
 * Default values are omitted from the URL to keep it clean.
 */

// TypeScript overloads: narrows return type to match the defaultValue type
export function useUrlState(key: string, defaultValue: string): [string, (v: string) => void];
export function useUrlState(key: string, defaultValue: string[]): [string[], (v: string[]) => void];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useUrlState(key: string, defaultValue: any): any {
  const [searchParams, setSearchParams] = useSearchParams();

  const raw = searchParams.get(key);

  const value = Array.isArray(defaultValue)
    ? raw
      ? raw.split(',')
      : defaultValue
    : (raw ?? defaultValue);

  const setValue = useCallback(
    (newValue: string | string[]) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const isDefault = Array.isArray(newValue)
            ? newValue.length === (defaultValue as string[]).length
            : newValue === defaultValue;

          if (isDefault) {
            next.delete(key);
          } else if (Array.isArray(newValue)) {
            next.set(key, newValue.join(','));
          } else {
            next.set(key, String(newValue));
          }
          return next;
        },
        { replace: true },
      );
    },
    [key, defaultValue, setSearchParams],
  );

  return [value, setValue];
}
