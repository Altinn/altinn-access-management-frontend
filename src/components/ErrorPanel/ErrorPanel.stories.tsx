import type { Meta, StoryObj } from '@storybook/react';

import type { ErrorPanelProps } from './ErrorPanel';
import { ErrorPanel } from './ErrorPanel';

type ErrorPanelPropsAndCustomArgs = React.ComponentProps<typeof ErrorPanel>;

const exampleArgs: ErrorPanelProps = {
  title: 'Title',
  message: 'Message',
  statusCode: '404',
};

export default {
  title: 'Components/ErrorPanel',
  component: ErrorPanel,
  argTypes: {
    onApply: { control: { disable: true } },
  },
  render: (args) => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
      <ErrorPanel
        {...exampleArgs}
        {...args}
      />
    </div>
  ),
} as Meta;

export const Default: StoryObj<ErrorPanelPropsAndCustomArgs> = {
  args: exampleArgs,
};
