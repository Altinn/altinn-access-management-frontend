import { createContext, useContext } from 'react';

export enum ActionBarIconVariant {
  Primary = 'primary',
  Secondary = 'secondary',
}

export type ClickHandler = () => void;

export const ActionBarContext = createContext<
  | {
      open: boolean;
      onClick: ClickHandler;
      headerId: string;
      contentId: string;
      iconVariant: ActionBarIconVariant;
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
