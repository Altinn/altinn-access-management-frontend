import { useSearchParams } from 'react-router';

export const useBackUrl = (defaultUrl: string): string => {
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  return returnTo ?? defaultUrl;
};
