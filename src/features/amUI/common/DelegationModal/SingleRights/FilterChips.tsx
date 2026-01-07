import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { DsChip } from '@altinn/altinn-components';

import classes from './ResourceSearch.module.css';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterChipsProps {
  filters: string[];
  filterOptions: FilterOption[];
  onRemoveFilter: (filter: string) => void;
}

export const FilterChips = ({ filters, filterOptions, onRemoveFilter }: FilterChipsProps) => {
  const { t } = useTranslation();

  const getFilterLabel = (value: string) => {
    const option = filterOptions.find((option) => option.value === value);
    return option ? option.label : '';
  };

  if (filters.length === 0) {
    return null;
  }

  return (
    <div className={classes.filterChips}>
      {filters.map((filterValue: string) => (
        <DsChip.Removable
          data-size='sm'
          key={filterValue}
          aria-label={`${t('common.remove')} ${String(getFilterLabel(filterValue))}`}
          onClick={() => {
            onRemoveFilter(filterValue);
          }}
        >
          {getFilterLabel(filterValue)}
        </DsChip.Removable>
      ))}
    </div>
  );
};
