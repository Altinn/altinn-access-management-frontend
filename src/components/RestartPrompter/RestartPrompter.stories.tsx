import type { Meta, StoryObj } from '@storybook/react';

import { RestartPrompter } from './RestartPrompter';

type RestartPrompterPropsAndCustomArgs = React.ComponentProps<typeof RestartPrompter>;

const exampleArgs: RestartPrompterPropsAndCustomArgs = {
  spacingBottom: false,
  severity: 'info',
  title: 'This is a title',
  ingress: 'This is an ingress',
  restartPath: '/restart',
};

export default {
  title: 'Components/RestartPrompter',
  component: RestartPrompter,
  argTypes: {
    severity: {
      options: ['info', 'success', 'warning', 'danger'],
      control: { type: 'radio' },
    },
    children: { control: { disable: true } },
  },
  render: (args) => (
    <div>
      <RestartPrompter
        {...exampleArgs}
        {...args}
      />
      <div style={{ background: 'darkGray', padding: '1rem' }}>
        Some content following the restart-prompter
      </div>
    </div>
  ),
} as Meta;

export const Default: StoryObj = {
  args: exampleArgs,
};
