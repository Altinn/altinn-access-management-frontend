import type { Meta, StoryObj } from '@storybook/react';

import { ButtonWithConfirmPopup } from './ButtonWithConfirmPopup';

type ButtonWithConfirmPopupPropsAndCustomArgs = React.ComponentProps<typeof ButtonWithConfirmPopup>;

export default {
  title: 'Features/AMUI/ButtonWithConfirmPopup',
  component: ButtonWithConfirmPopup,
  render: (args) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100vh',
      }}
    >
      <ButtonWithConfirmPopup {...(args as ButtonWithConfirmPopupPropsAndCustomArgs)} />
    </div>
  ),
} as Meta;

export const Default: StoryObj = {
  args: {
    message: 'Er du sikker?',
    confirmButtonContent: 'Bekreft',
    cancelButtonContent: 'Avbryt',
    triggerButtonContent: 'Gjør noe',
    confirmButtonProps: {
      color: 'primary',
      variant: 'primary',
      size: 'md',
    },
    cancelButtonProps: {
      color: 'neutral',
      variant: 'secondary',
      size: 'md',
    },
    triggerButtonProps: {
      color: 'primary',
      variant: 'tertiary',
      size: 'md',
    },
    popoverProps: {
      placement: 'top',
      size: 'md',
      color: 'neutral',
      variant: 'default',
    },
    onConfirm: () => console.log('onConfirm'),
  },
  argTypes: {
    message: { control: { type: 'text' } },
    confirmButtonContent: { control: { type: 'text' } },
    cancelButtonContent: { control: { type: 'text' } },
    triggerButtonContent: { control: { type: 'text' } },
    confirmButtonProps: { control: { disabled: true } },
    cancelButtonProps: { control: { disabled: true } },
    triggerButtonProps: { control: { disabled: true } },
    popoverProps: { control: { disabled: true } },
    onConfirm: { control: { disabled: true } },
  },
};
