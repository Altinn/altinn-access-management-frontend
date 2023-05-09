import * as React from 'react';
import { useState, useEffect } from 'react';
import { Checkbox } from '@digdir/design-system-react';
import { SearchField } from '@altinn/altinn-design-system';

import { arraysEqual } from '@/resources/utils';
import { usePrevious } from '@/resources/hooks';

import type { FilterOption } from './utils';
import classes from './FilterContent.module.css';

export interface FilterContentProps {
  options: FilterOption[];
  value: string[];
  onValueChange: (value: string[]) => void;
  searchable?: boolean;
  compact?: boolean;
}

export const FilterContent = ({
  options,
  value,
  searchable = true,
  compact = true,
  onValueChange,
}: FilterContentProps) => {
  const [selectedValues, setSelectedValues] = useState<string[]>(value);

  // Update selected values when there are external changes
  const prevValue = usePrevious(value);
  useEffect(() => {
    if (!arraysEqual(value, prevValue)) {
      setSelectedValues(value);
    }
  }, [value]);

  const changeHandler = (newValues: string[], addedValue?: string) => {
    setSelectedValues(newValues);
    onValueChange(newValues);
  };

  const HandleSelection = (selectedValue: string) => {
    if (selectedValues?.includes(selectedValue)) {
      changeHandler(selectedValues.filter((value) => value !== selectedValue));
    } else {
      changeHandler([...selectedValues, selectedValue], selectedValue);
    }
  };

  const checkboxes = options.map((option, index) => {
    const isSelected = selectedValues?.includes(option.value);
    return (
      <div
        className={classes.option}
        key={option.value}
      >
        <Checkbox
          onChange={() => {
            HandleSelection(option.value);
          }}
          checked={isSelected}
          label={option.label}
          compact={compact}
        />
      </div>
    );
  });

  return (
    <div className={classes.filterContent}>
      {searchable && (
        <div className={classes.searchField}>
          <SearchField />
        </div>
      )}
      <div className={classes.scrollContainer}>
        <div className={classes.optionList}>{checkboxes}</div>
      </div>
    </div>
  );
};
