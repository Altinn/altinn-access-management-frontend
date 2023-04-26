import { createContext, useContext } from 'react';

export type ClickHandler = () => void;

export const ActionBarContext = createContext<
  | {
      open: boolean;
      onClick: ClickHandler | undefined;
      headerId: string;
      contentId: string;
      iconVariant: 'primary' | 'secondary';
      color: 'light' | 'neutral' | 'warning' | 'success' | 'danger';
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
