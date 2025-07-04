import type { Meta, StoryObj } from '@storybook/react';

import { ValidationErrorMessage } from './ValidationErrorMessage';

export default {
  title: 'Features/AMUI/ValidationErrorMessage',
  component: ValidationErrorMessage,
  render: (args) => (
    <ValidationErrorMessage
      errorCode={''}
      {...args}
    />
  ),
} as Meta;

export const Default: StoryObj<typeof ValidationErrorMessage> = {
  args: { errorCode: 'AM.VLD-00002' },
};
