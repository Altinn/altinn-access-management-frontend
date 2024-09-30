import type { Meta, StoryObj } from '@storybook/react';

import { SearchSection } from './SearchSection';

type SearchSectionPropsAndCustomArgs = React.ComponentProps<typeof SearchSection>;

export default {
  title: 'Features/SingleRight/SearchSection',
  component: SearchSection,
  render: (args) => <SearchSection {...(args as SearchSectionPropsAndCustomArgs)} />,
} as Meta;

export const Default: StoryObj = {
  args: {
    onAdd: () => console.log('onAdd'),
    onUndo: () => console.log('onUndo'),
  },
  argTypes: {
    onAdd: { control: { disabled: true } },
    onUndo: { control: { disabled: true } },
  },
};
