import type { Meta, StoryObj } from '@storybook/react';
import type { ButtonProps } from '@digdir/designsystemet-react';
import { Button } from '@digdir/designsystemet-react';

import { SnackbarContainer } from './Snackbar';
import type { SnackbarInput } from './SnackbarProvider';
import { SnackbarMessageVariant, SnackbarProvider, useSnackbar } from './SnackbarProvider';

interface SnackbarTriggerProps extends ButtonProps {
  children?: React.ReactNode;
  snackbarMessageProps: SnackbarInput;
}

const SnackbarTrigger = ({ children, snackbarMessageProps, ...props }: SnackbarTriggerProps) => {
  const { openSnackbar } = useSnackbar();

  return (
    <Button
      onClick={() => openSnackbar(snackbarMessageProps)}
      {...props}
    >
      {children}
    </Button>
  );
};

export default {
  title: 'Features/AMUI/Snackbar',
  component: SnackbarContainer,
  render: (args) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
        alignItems: 'center',
        width: '100%',
        height: '100vh',
      }}
    >
      <SnackbarProvider>
        <>
          <SnackbarTrigger
            snackbarMessageProps={{
              message: 'Success message',
              variant: SnackbarMessageVariant.Default,
              dismissable: true,
              duration: 5000,
            }}
          >
            Trigger default
          </SnackbarTrigger>
          <SnackbarTrigger
            color='neutral'
            snackbarMessageProps={{
              message: 'Error message',
              variant: SnackbarMessageVariant.Accent,
              dismissable: true,
              duration: 5000,
            }}
          >
            Trigger accent
          </SnackbarTrigger>
          <SnackbarTrigger
            color='neutral'
            snackbarMessageProps={{
              message: 'Error message',
              variant: SnackbarMessageVariant.Accent,
              dismissable: false,
              duration: 5000,
            }}
          >
            Trigger not dismissable
          </SnackbarTrigger>
          <SnackbarContainer {...args} />
        </>
      </SnackbarProvider>
    </div>
  ),
} as Meta;

export const Default: StoryObj = {
  args: {},
  argTypes: {},
};
