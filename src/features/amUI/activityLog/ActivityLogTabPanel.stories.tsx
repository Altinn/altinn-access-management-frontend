import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { RootProvider } from '@altinn/altinn-components';

import { ActivityLogTabPanel } from './ActivityLogTabPanel';
import { getSampleActivityLog, sampleReportee } from './activityLogSampleData';
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

  const { entries, partyOptions, hasMore } = getSampleActivityLog(
    { direction, selectedPartyIds, pageNo, pageSize: STORY_PAGE_SIZE },
    empty ? [] : undefined,
  );

  return (
    <ActivityLogTabPanel
      area='maskinporten'
      direction={direction}
      onDirectionChange={(newDirection) => {
        changeDirection(newDirection);
        setPageNo(0);
      }}
      reporteeName={sampleReportee.name}
      filterState={filterState}
      onFilterStateChange={(newFilterState) => {
        changeFilterState(newFilterState);
        setPageNo(0);
      }}
      partyOptions={partyOptions}
      entries={entries}
      isLoading={isLoading}
      isError={isError}
      hasMore={hasMore}
      onLoadMore={() => setPageNo((current) => current + 1)}
    />
  );
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
