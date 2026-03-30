import { useSearchParams } from 'react-router';

/**
 * Syncs a string state value with a URL search param.
 *
 * If `validValues` is provided, invalid values from the URL are ignored and the
 * hook falls back to `defaultValue`. The setter accepts `string` so it can be
 * passed directly to components like `DsTabs`, and invalid values are filtered
 * out before updating the URL.
 */
interface UseUrlParamStateParams<T extends string> {
  key: string;
  defaultValue: T;
  validValues?: readonly T[];
}

export const useUrlParamState = <T extends string>({
  key,
  defaultValue,
  validValues,
}: UseUrlParamStateParams<T>) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const paramValue = searchParams.get(key);

  const value =
    paramValue && (!validValues || validValues.includes(paramValue as T))
      ? (paramValue as T)
      : defaultValue;

  const setValue = (nextValue: string) => {
    if (validValues && !validValues.includes(nextValue as T)) {
      return;
    }

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set(key, nextValue);
        return next;
      },
      { replace: true },
    );
  };

  return [value, setValue] as const;
};
