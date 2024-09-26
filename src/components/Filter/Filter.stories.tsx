import type { Meta, StoryObj } from '@storybook/react';
import { FilterIcon } from '@navikt/aksel-icons';
import { action } from '@storybook/addon-actions';

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
  label: 'Filter',
  applyButtonLabel: 'Apply',
  resetButtonLabel: 'Reset',
  icon: <FilterIcon />,
  values: selectedFilters,
  fullScreenModal: false,
  closeButtonAriaLabel: 'Close filter',
  options: filterOptions,
  onApply: action('apply'),
};

export default {
  title: 'Components/Filter',
  component: Filter,
  argTypes: {
    options: { control: { disable: true } },
    onApply: { control: { disable: true } },
    values: { control: { type: 'multi-select' } },
    icon: { control: { disable: true } },
    isLoading: { control: { type: 'check' } },
  },
  render: (args) => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
      <Filter {...args} />
    </div>
  ),
} as Meta;

export const Default: StoryObj<FilterPropsAndCustomArgs> = {
  args: exampleArgs,
};
