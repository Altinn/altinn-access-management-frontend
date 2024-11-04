import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

import { Snackbar } from './Snackbar';

export enum SnackbarMessageVariant {
  Success = 'success',
  Error = 'error',
  Info = 'info',
}

export interface SnackbarMessage {
  id: string;
  message: string;
  variant: SnackbarMessageVariant;
  duration: number;
  dismissable: boolean;
}

interface SnackbarConfig {
  isOpen: boolean;
  storedMessages: SnackbarMessage[];
}

export interface SnackbarInput {
  message: string;
  variant: SnackbarMessageVariant;
  dismissable?: boolean;
  duration?: number;
}

interface SnackbarOutput {
  isOpen: boolean;
  storedMessages: SnackbarMessage[];
  closeSnackbarItem: (id: string) => void;
  openSnackbar: (input: SnackbarInput) => string;
  closeAllSnackbars: () => void;
}

const SnackbarContext = createContext<SnackbarOutput | undefined>(undefined);

export enum SnackbarDuration {
  infinite = 0,
  short = 1000,
  normal = 3000,
  long = 5000,
}

const defaultDuration = SnackbarDuration.normal; // Example duration

export const SnackbarProvider = ({ children }: { children: JSX.Element }) => {
  const [snackbarConfig, setSnackbarConfig] = useState<SnackbarConfig>({
    isOpen: false,
    storedMessages: [],
  });
  const closingTime = useRef<NodeJS.Timeout | null>(null);

  const openSnackbar = ({
    message,
    variant = SnackbarMessageVariant.Info,
    dismissable = true,
    duration = defaultDuration,
  }: SnackbarInput): string => {
    const id = btoa(String(Math.random())).substring(0, 12);
    setSnackbarConfig((prevConfig) => ({
      isOpen: true,
      storedMessages: [
        ...prevConfig.storedMessages,
        { id, variant, message, duration, dismissable },
      ],
    }));
    return id;
  };

  const closeSnackbarItem = useCallback((id: string) => {
    setSnackbarConfig((prevConfig) => {
      const updatedStoredMessages = prevConfig.storedMessages.filter((item) => item.id !== id);
      return {
        isOpen: updatedStoredMessages.length > 0,
        storedMessages: updatedStoredMessages,
      };
    });
  }, []);

  const closeAllSnackbars = () => {
    setSnackbarConfig({
      isOpen: false,
      storedMessages: [],
    });
  };

  useEffect(() => {
    const storedMessageItem = snackbarConfig.storedMessages.find((item) => item.duration > 0);
    if (storedMessageItem) {
      closingTime.current = setTimeout(() => {
        closeSnackbarItem(storedMessageItem.id);
      }, storedMessageItem.duration);
    }

    return () => {
      if (closingTime.current) {
        clearTimeout(closingTime.current);
      }
    };
  }, [snackbarConfig.storedMessages, closeSnackbarItem]);

  return (
    <SnackbarContext.Provider
      value={{ ...snackbarConfig, closeSnackbarItem, openSnackbar, closeAllSnackbars }}
    >
      {children}
      <Snackbar />
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = (): SnackbarOutput => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};
