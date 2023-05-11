import * as React from 'react';
import { useState, useEffect } from 'react';
import { Checkbox } from '@digdir/design-system-react';
import { SearchField } from '@altinn/altinn-design-system';

import { arraysEqual } from '@/resources/utils';
import { usePrevious } from '@/resources/hooks';

import { optionSearch } from './utils';
import type { FilterOption } from './utils';
import classes from './OptionDisplay.module.css';

export interface OptionDisplayProps {
  options: FilterOption[];
  value: string[];
  onValueChange: (value: string[]) => void;
  searchable?: boolean;
  compact?: boolean;
}

export const OptionDisplay = ({
  options,
  value,
  searchable = true,
  compact = true,
  onValueChange,
}: OptionDisplayProps) => {
  const [selectedValues, setSelectedValues] = useState<string[]>(value);
  const [sortedOptions, setSortedOptions] = useState<FilterOption[]>(options);

  // Update selected values when there are external changes
  const prevValue = usePrevious(value);
  useEffect(() => {
    if (!arraysEqual(value, prevValue)) {
      setSelectedValues(value);
    }
  }, [value]);

  // Update sorted options when there are external changes
  const prevOptions = usePrevious(options);
  useEffect(() => {
    if (!arraysEqual(options, prevOptions)) {
      setSortedOptions(options);
    }
  }, [options]);

  const changeHandler = (newValues: string[], addedValue?: string) => {
    setSelectedValues(newValues);
    onValueChange(newValues);
  };

  const handleSelection = (selectedValue: string) => {
    if (selectedValues?.includes(selectedValue)) {
      changeHandler(selectedValues.filter((value) => value !== selectedValue));
    } else {
      changeHandler([...selectedValues, selectedValue], selectedValue);
    }
  };

  const handleSearch = (searchString: string) => {
    setSortedOptions(optionSearch(options, searchString));
  };

  const checkboxes = sortedOptions.map((option, index) => {
    const isSelected = selectedValues?.includes(option.value);
    return (
      <div
        className={classes.option}
        key={option.value}
      >
        <Checkbox
          onChange={() => {
            handleSelection(option.value);
          }}
          checked={isSelected}
          label={option.label}
          compact={compact}
        />
      </div>
    );
  });

  return (
    <div className={classes.optionDisplay}>
      {searchable && (
        <div className={classes.searchField}>
          <SearchField
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              handleSearch(event.target.value);
            }}
          />
        </div>
      )}
      <div className={classes.scrollContainer}>
        <div className={classes.optionList}>{checkboxes}</div>
      </div>
    </div>
  );
};
