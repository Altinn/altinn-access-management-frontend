import type { Meta, StoryObj } from '@storybook/react';

import { CircularProgress } from './CircularProgress';

type CircularProgressPropsAndCustomArgs = React.ComponentProps<typeof CircularProgress>;

const exampleArgs: CircularProgressPropsAndCustomArgs = {
  value: 50,
  width: 400,
  strokeWidth: 2.5,
  ariaLabel: 'Progress',
  label: 'Progress',
  id: '123456789',
};

export default {
  title: 'Components/CircularProgress',
  component: CircularProgress,
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
  },
} as Meta;

export const Default: StoryObj = {
  args: exampleArgs,
};
