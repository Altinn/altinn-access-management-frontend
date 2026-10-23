import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { RootProvider } from '@altinn/altinn-components';

import { ActivityLogTabPanel, type ActivityLogTabPanelProps } from './ActivityLogTabPanel';
import { getSampleActivityLog, sampleReportee } from './activityLogSampleData';
import { useActivityLogQueryState } from './useActivityLogQueryState';

const STORY_PAGE_SIZE = 4;

interface StoryArgs {
  isLoading?: boolean;
  isError?: boolean;
  empty?: boolean;
}

const ActivityLogTabPanelStory = ({ isLoading, isError, empty }: StoryArgs) => {
  const {
    direction,
    changeDirection,
    filterState,
    changeFilterState,
    selectedPartyIds,
    pageNo,
    loadMore,
  } = useActivityLogQueryState();

  const { entries, partyOptions, hasMore } = getSampleActivityLog(
    { direction, selectedPartyIds, pageNo, pageSize: STORY_PAGE_SIZE },
    empty ? [] : undefined,
  );

  const props: ActivityLogTabPanelProps = {
    area: 'maskinporten',
    direction,
    onDirectionChange: changeDirection,
    reporteeName: sampleReportee.name,
    filterState,
    onFilterStateChange: changeFilterState,
    partyOptions,
    entries,
    isLoading,
    isError,
    hasMore,
    onLoadMore: loadMore,
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
