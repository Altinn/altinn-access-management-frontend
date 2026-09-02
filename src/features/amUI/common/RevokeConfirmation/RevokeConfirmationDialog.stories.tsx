import type { Meta, StoryObj } from '@storybook/react-vite';
import { RootProvider } from '@altinn/altinn-components';

import { RevokeConfirmationDialog } from './RevokeConfirmationDialog';

const meta: Meta<typeof RevokeConfirmationDialog> = {
  title: 'Features/AMUI/RevokeConfirmationDialog',
  component: RevokeConfirmationDialog,
  args: {
    onConfirm: () => {},
    onCancel: () => {},
  },
  decorators: [
    (Story) => (
      <RootProvider>
        <div style={{ maxWidth: '38rem' }}>
          <Story />
        </div>
      </RootProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof RevokeConfirmationDialog>;

export const CannotRedelegate: Story = {
  args: { open: true },
};
