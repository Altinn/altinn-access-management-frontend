import { useCallback, useMemo, useState } from 'react';
import type { FilterState } from '@altinn/altinn-components';

import type { ActivityLogDirection } from './types';

export const ACTIVITY_LOG_PARTY_FILTER = 'party';

/**
 * Holds what the user has chosen for one area of the activity log: the direction and the party
 * filter. Changing the direction clears the filter, since the parties to choose from differ.
 */
export const useActivityLogQueryState = () => {
  const [direction, setDirection] = useState<ActivityLogDirection>('from');
  const [filterState, setFilterState] = useState<FilterState>({});

  const selectedPartyIds = useMemo(
    () => (filterState[ACTIVITY_LOG_PARTY_FILTER] ?? []).map(String),
    [filterState],
  );

  const changeDirection = useCallback((newDirection: ActivityLogDirection) => {
    setDirection(newDirection);
    setFilterState({});
  }, []);

  return {
    direction,
    changeDirection,
    filterState,
    changeFilterState: setFilterState,
    selectedPartyIds,
    /** The side of the entries the party filter applies to: the receivers when the reportee gave access. */
    counterpartField: direction === 'from' ? 'to' : 'from',
  } as const;
};
