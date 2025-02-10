import type { Meta, StoryObj } from '@storybook/react';

import { TechnicalErrorParagraphs } from './TechnicalErrorParagraphs';

export default {
  title: 'Features/AMUI/TechnicalErrorParagraphs',
  component: TechnicalErrorParagraphs,
  render: (args) => (
    <TechnicalErrorParagraphs
      status='404'
      time='2025-10-01T10:00:00Z'
      {...args}
    />
  ),
} as Meta;

export const Default: StoryObj<typeof TechnicalErrorParagraphs> = {
  args: { size: 'sm', status: '404', time: '2025-10-01T10:00:00Z' },
};
