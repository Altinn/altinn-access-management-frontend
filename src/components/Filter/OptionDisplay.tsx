import * as React from 'react';
import { useState, useEffect } from 'react';
import { Checkbox, Paragraph, Search } from '@digdir/designsystemet-react';
import { useTranslation } from 'react-i18next';

import { arraysEqual } from '@/resources/utils';
import { usePrevious } from '@/resources/hooks';

import { optionSearch } from './utils';
import type { FilterOption } from './utils';
import classes from './OptionDisplay.module.css';

export interface OptionDisplayProps {
  options: FilterOption[];
  values?: string[];
  onValueChange?: (value: string[]) => void;
  searchable?: boolean;
  compact?: boolean;
}

/**
 * OptionDisplay Component
 *
 * This component displays a list of options with checkboxes for selection. It supports searching and compact mode.
 *
 * @component
 * @example
 * <OptionDisplay
 *   options={filterOptions}
 *   values={selectedValues}
 *   onValueChange={handleValueChange}
 *   searchable={true}
 *   compact={false}
 * />
 *
 * @param {FilterOption[]} options - The available filter options
 * @param {string[]} [values] - A list of the selected values. Can be used to set selected values externally
 * @param {function} [onValueChange] - Callback function to handle changes in selected values
 * @param {boolean} [searchable=false] - When true displays a search field that enables search within the options
 * @param {boolean} [compact=true] - Indicates whether to use compact mode for checkboxes
 * @returns {React.ReactNode} Rendered component
 */
export const OptionDisplay = ({
  options,
  values,
  searchable,
  compact = true,
  onValueChange,
}: OptionDisplayProps) => {
  const [selectedValues, setSelectedValues] = useState<string[]>(values ?? []);
  const [sortedOptions, setSortedOptions] = useState<FilterOption[]>(options);
  const { t } = useTranslation('common');

  // Update selected values when there are external changes
  const prevvalues = usePrevious(values);
  useEffect(() => {
    if (!arraysEqual(values, prevvalues)) {
      setSelectedValues(values ?? []);
    }
  }, [values]);

  // Update sorted options when there are external changes
  const prevOptions = usePrevious(options);
  useEffect(() => {
    if (!arraysEqual(options, prevOptions)) {
      setSortedOptions(options);
    }
  }, [options]);

  const changeHandler = (newValues: string[]) => {
    setSelectedValues(newValues);
    onValueChange?.(newValues);
  };

  const handleSelection = (selectedValue: string) => {
    if (selectedValues?.includes(selectedValue)) {
      changeHandler(selectedValues.filter((v) => v !== selectedValue));
    } else {
      changeHandler([...selectedValues, selectedValue]);
    }
  };

  const handleSearch = (searchString: string) => {
    setSortedOptions(optionSearch(options, searchString));
  };

  const checkboxes = sortedOptions.map((option) => {
    const isSelected = selectedValues?.includes(option.value);
    return (
      <button
        className={classes.option}
        key={option.label}
        onClick={() => {
          handleSelection(option.value);
        }}
        tabIndex={-1}
      >
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <Checkbox
          className={classes.optionCheckbox}
          onChange={() => {
            handleSelection(option.value);
          }}
          size={compact ? 'small' : 'medium'}
          value={option.value}
          checked={isSelected}
          aria-label={option.label}
        ></Checkbox>
        <Paragraph
          as={'label'}
          className={classes.optionLabel}
          size={compact ? 'small' : 'medium'}
        >
          {option.label}
        </Paragraph>
      </button>
    );
  });

  return (
    <div className={classes.optionDisplay}>
      {searchable && (
        <div className={classes.searchField}>
          <Search
            size='small'
            label={String(t('common.search'))}
            hideLabel
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              handleSearch(event.target.value);
            }}
            onClear={() => {
              handleSearch('');
            }}
          />
        </div>
      )}
      <div
        className={classes.scrollContainer}
        tabIndex={-1}
      >
        <div className={classes.optionList}>{checkboxes}</div>
      </div>
    </div>
  );
};
