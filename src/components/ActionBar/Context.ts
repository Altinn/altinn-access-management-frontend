import { createContext, useContext } from 'react';

export type ClickHandler = () => void;

export const ActionBarContext = createContext<
  | {
      open: boolean;
      toggleOpen?: ClickHandler | undefined;
      headerId: string;
      contentId: string;
      color: 'light' | 'dark' | 'neutral' | 'warning' | 'success' | 'danger';
      size: 'small' | 'medium' | 'large';
    }
  | undefined
>(undefined);

export const useActionBarContext = () => {
  const context = useContext(ActionBarContext);
  if (context === undefined) {
    throw new Error('useActionBarContext must be used within an ActionBarContext');
  }

  return context;
};
