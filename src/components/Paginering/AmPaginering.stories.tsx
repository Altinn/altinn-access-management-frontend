import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { AmPagination } from './AmPaginering';

type AmPaginationPropsAndCustomArgs = React.ComponentProps<typeof AmPagination>;

const paginatedDummyData = Array.from({ length: 105 }, (_, i) => i + 1);

const TestAmPagination = (props: AmPaginationPropsAndCustomArgs) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(paginatedDummyData.length / itemsPerPage);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
      <ul>
        {paginatedDummyData
          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
          .map((item) => (
            <li key={item}>{`Element: ${item}`}</li>
          ))}
      </ul>
      <AmPagination
        {...props}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
      />
    </div>
  );
};

export default {
  title: 'Components/AmPagination',
  component: AmPagination,
} as Meta;

export const Default: StoryObj<AmPaginationPropsAndCustomArgs> = {
  args: {
    totalPages: 10,
    showPages: 5,
    currentPage: 1,
    hideLabels: false,
    size: 'md',
  },
  argTypes: {
    totalPages: { control: { type: 'number' } },
    showPages: { control: { type: 'number' } },
    size: { control: { type: 'inline-radio', options: ['sm', 'md', 'lg'] } },
    currentPage: { control: { type: 'number' } },
    hideLabels: { control: { type: 'boolean' } },
  },
  render: (args) => <AmPagination {...args} />,
};

export const Test: StoryObj<AmPaginationPropsAndCustomArgs> = {
  render: (args) => <TestAmPagination {...args} />,
  args: {
    showPages: 5,
  },
  argTypes: {
    showPages: { control: { type: 'number' } },
    totalPages: { disabled: true },
    currentPage: { disabled: true },
    setCurrentPage: { disabled: true },
    hideLabels: { control: { type: 'boolean' } },
    size: { control: { type: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  },
};
