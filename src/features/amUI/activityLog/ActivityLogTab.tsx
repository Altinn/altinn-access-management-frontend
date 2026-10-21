import React from 'react';

import { ActivityLogTabPanel } from './ActivityLogTabPanel';
import type { ActivityLogArea } from './types';
import { useActivityLogQueryState } from './useActivityLogQueryState';

export const ActivityLogTab = ({
  area,
  reporteeName,
}: {
  area: ActivityLogArea;
  reporteeName: string;
}) => {
  const { direction, changeDirection, filterState, changeFilterState, loadMore } =
    useActivityLogQueryState();

  return (
    <ActivityLogTabPanel
      area={area}
      direction={direction}
      onDirectionChange={changeDirection}
      reporteeName={reporteeName}
      filterState={filterState}
      onFilterStateChange={changeFilterState}
      partyOptions={[]}
      entries={[]}
      onLoadMore={loadMore}
    />
  );
};
