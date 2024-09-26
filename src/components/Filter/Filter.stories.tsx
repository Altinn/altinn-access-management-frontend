import type { Meta, StoryObj } from '@storybook/react';
import { FilterIcon } from '@navikt/aksel-icons';

import type { FilterProps } from './Filter';
import { Filter } from './Filter';

type FilterPropsAndCustomArgs = React.ComponentProps<typeof Filter>;
const filterOptions = [
  { label: 'Option A', value: 'A' },
  { label: 'Option B', value: 'B' },
  { label: 'Option C', value: 'C' },
  { label: 'Option D', value: 'D' },
];

const selectedFilters = ['A', 'C'];

const exampleArgs: FilterProps = {
  fullScreenModal: false,
  searchable: true,
  isLoading: false,
  label: 'Filter',
  applyButtonLabel: 'Apply',
  resetButtonLabel: 'Reset',
  closeButtonAriaLabel: 'Close filter',
  options: filterOptions,
  values: selectedFilters,
  icon: <FilterIcon />,
  onApply: (value) => console.log('Applied filters:', value),
};

export default {
  title: 'Components/Filter',
  component: Filter,
  argTypes: {
    onApply: { control: { disable: true } },
    icon: { control: { disable: true } },
    values: { control: { disable: true } },
    options: { control: { disable: true } },
    className: { control: { disable: true } },
  },
  render: (args) => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
      <Filter
        {...exampleArgs}
        {...args}
      />
    </div>
  ),
} as Meta;

export const Default: StoryObj<FilterPropsAndCustomArgs> = {
  args: exampleArgs,
};
