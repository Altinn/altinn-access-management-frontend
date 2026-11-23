import { useEffect, useMemo, useState } from 'react';

import { useGetResourceOwnersQuery } from '@/rtk/features/resourceApi';
import { useDebouncedValue } from '@/resources/hooks';

import { ResourceFilterToolbar } from '../ResourceFilterToolbar/ResourceFilterToolbar';

interface ServicesToolbarProps {
  onSearchChange: (search: string) => void;
  filterState: string[];
  setFilterState: (filters: string[]) => void;
}

/**
 * Owns the raw search input value and reports it upwards only once debounced.
 *
 * Keeping the per-keystroke value out of ServiceSearchLists matters for more than the
 * request count: everything below the toolbar (both service lists, and a popover plus avatar
 * group per row) is keyed on the debounced value, so re-rendering it on each keystroke is
 * work that cannot change the output. Clearing the field applies immediately.
 */
export const ServicesToolbar = ({
  onSearchChange,
  filterState,
  setFilterState,
}: ServicesToolbarProps) => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, search ? 300 : 0);
  const { data: ROdata } = useGetResourceOwnersQuery();

  // Memoised so typing, which re-renders only this component, doesn't rebuild the service
  // owner list on every keystroke: ResourceFilterToolbar turns it into one filter item per
  // owner, and altinn-components clones that list again on each render.
  const serviceOwnerOptions = useMemo(() => {
    return (ROdata ?? []).map((ro) => ({
      label: ro.organisationName || ro.organisationCode,
      value: ro.organisationCode,
    }));
  }, [ROdata]);

  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  return (
    <ResourceFilterToolbar
      search={search}
      setSearch={setSearch}
      filterState={filterState}
      setFilterState={setFilterState}
      serviceOwnerOptions={serviceOwnerOptions}
    />
  );
};
