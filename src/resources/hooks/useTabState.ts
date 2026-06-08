import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';

interface UseTabStateOptions {
  tabs: readonly string[];
  defaultTab: string;
}

export const useTabState = ({
  tabs,
  defaultTab,
}: UseTabStateOptions): [string, (value: string) => void] => {
  const { hash, search } = useLocation();
  const navigate = useNavigate();

  const current = hash.replace('#', '');
  const chosenTab = tabs.includes(current) ? current : defaultTab;

  const setChosenTab = useCallback(
    (value: string) => {
      navigate({ search, hash: value === defaultTab ? '' : `#${value}` }, { replace: true });
    },
    [navigate, defaultTab, search],
  );

  return [chosenTab, setChosenTab];
};
