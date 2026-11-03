import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { type FilterState, RootProvider } from '@altinn/altinn-components';

import { ActivityLogTabPanel, type ActivityLogTabPanelProps } from './ActivityLogTabPanel';
import { getSampleActivityLog, sampleReportee } from './activityLogSampleData';
import type { ActivityLogDirection } from './types';
import { useActivityLogQueryState } from './useActivityLogQueryState';

const STORY_PAGE_SIZE = 4;

interface StoryArgs {
  isLoading?: boolean;
  isError?: boolean;
  empty?: boolean;
}

const ActivityLogTabPanelStory = ({ isLoading, isError, empty }: StoryArgs) => {
  const { direction, changeDirection, filterState, changeFilterState, selectedPartyIds } =
    useActivityLogQueryState();
  const [pageNo, setPageNo] = useState(0);

  const onDirectionChange = (newDirection: ActivityLogDirection) => {
    changeDirection(newDirection);
    setPageNo(0);
  };
  const onFilterStateChange = (newFilterState: FilterState) => {
    changeFilterState(newFilterState);
    setPageNo(0);
  };

  const { entries, partyOptions, hasMore } = getSampleActivityLog(
    { direction, selectedPartyIds, pageNo, pageSize: STORY_PAGE_SIZE },
    empty ? [] : undefined,
  );

  const props: ActivityLogTabPanelProps = {
    area: 'maskinporten',
    direction,
    onDirectionChange,
    reporteeName: sampleReportee.name,
    filterState,
    onFilterStateChange,
    partyOptions,
    entries,
    isLoading,
    isError,
    hasMore,
    onLoadMore: () => setPageNo((current) => current + 1),
  };

  return <ActivityLogTabPanel {...props} />;
};

const meta: Meta<StoryArgs> = {
  title: 'Features/AMUI/ActivityLog/ActivityLogTabPanel',
  render: (args) => <ActivityLogTabPanelStory {...args} />,
  decorators: [
    (Story) => (
      <RootProvider>
        <Story />
      </RootProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<StoryArgs>;

export const Maskinporten: Story = { args: {} };

export const Loading: Story = { args: { isLoading: true } };

export const Empty: Story = { args: { empty: true } };

export const ErrorState: Story = { args: { isError: true } };
