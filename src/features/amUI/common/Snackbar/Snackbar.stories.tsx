import type { Meta, StoryObj } from '@storybook/react';
import type { ButtonProps } from '@digdir/designsystemet-react';
import { Button } from '@digdir/designsystemet-react';

import { Snackbar } from './Snackbar';
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
  component: Snackbar,
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
              variant: SnackbarMessageVariant.Success,
              dismissable: true,
              duration: 5000,
            }}
          >
            Trigger success
          </SnackbarTrigger>
          <SnackbarTrigger
            color='danger'
            snackbarMessageProps={{
              message: 'Error message',
              variant: SnackbarMessageVariant.Error,
              dismissable: true,
              duration: 5000,
            }}
          >
            Trigger error
          </SnackbarTrigger>
          <SnackbarTrigger
            color='neutral'
            snackbarMessageProps={{
              message: 'Info message',
              variant: SnackbarMessageVariant.Info,
              dismissable: true,
              duration: 5000,
            }}
          >
            Trigger info
          </SnackbarTrigger>
          <Snackbar {...args} />
        </>
      </SnackbarProvider>
    </div>
  ),
} as Meta;

export const Default: StoryObj = {
  args: {},
  argTypes: {},
};
