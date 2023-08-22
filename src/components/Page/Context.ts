import { createContext, useContext } from 'react';

export type PageColor = 'dark' | 'light' | 'success' | 'danger';

export type PageSize = 'small' | 'medium';

export const PageContext = createContext({
  color: 'dark',
  size: 'medium',
});

export const usePageContext = () => {
  const context = useContext(PageContext);
  if (context === undefined) {
    throw new Error('usePageContext must be used within a PageContext');
  }

  return context;
};
