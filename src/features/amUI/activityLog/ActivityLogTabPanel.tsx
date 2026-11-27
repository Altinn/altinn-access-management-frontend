import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DsAlert,
  DsParagraph,
  FieldsetBase,
  type FilterProps,
  type FilterState,
  RadioOptions,
  SelectDateFilter,
  Toolbar,
} from '@altinn/altinn-components';
import { CalendarIcon } from '@navikt/aksel-icons';

import { useLanguageCode } from '@/resources/hooks/useLanguageCode';

import type {
  ActivityLogArea,
  ActivityLogDirection,
  ActivityLogDto,
  ActivityLogFilterValueDto,
} from './types';
import { ACTIVITY_LOG_DATE_FILTER, ACTIVITY_LOG_PARTY_FILTER } from './useActivityLogQueryState';
import {
  getActivityLogDateFilterLabel,
  getActivityLogLocale,
  getActivityLogPartyFilterLabel,
  getActivityLogPartyOptions,
} from './activityLogUtils';
import { ActivityLogTimeline } from './ActivityLogTimeline';
import classes from './ActivityLogTabPanel.module.css';

/** One value filter to offer: a searchable picker over the (id, name) pairs of one field. */
export interface ActivityLogValueFilterProps {
  /** The toolbar filter key: `party` for the counterpart, else the field. */
  name: string;
  /** The field the options come from (`GET {area}/filter/{field}`), which also names the picker. */
  field: string;
  /** May hold several names for one id (a renamed party); they are folded into one option. */
  options: ActivityLogFilterValueDto[];
  isLoading?: boolean;
}

export interface ActivityLogTabPanelProps {
  area: ActivityLogArea;
  direction: ActivityLogDirection;
  onDirectionChange: (direction: ActivityLogDirection) => void;
  /** Display name of the reportee the log is shown for. */
  reporteeName: string;
  /**The toolbar's filter state */
  filterState: FilterState;
  onFilterStateChange: (filterState: FilterState) => void;
  /**
   * The value filters to offer, in order: the party filter for the counterpart of the direction and
   * one per other field the area reports. The period can always be chosen.
   */
  valueFilters: ActivityLogValueFilterProps[];
  /**
   * Called with what the user types in a picker, and '' when the search is cleared or the picker
   * closes, so its options can be looked up on the server.
   */
  onValueFilterSearch?: (name: string, term: string) => void;
  /** Entries as returned by the API for the current direction and filter, newest first. */
  entries: ActivityLogDto[];
  isLoading?: boolean;
  isError?: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

interface ValueFilterSearch {
  /** Receives the search text as typed, and '' when the search is cleared or the picker closes. */
  onSearch?: (term: string) => void;
  isLoading?: boolean;
}

/**
 * A searchable multi-select over (id, name) pairs, for the party and "performed by" filters. The
 * picker also narrows the options it has client-side, with the same substring match as the server,
 * so the server's hits stay visible while a lookup is under way.
 */
const toValueFilter = (
  name: string,
  title: string,
  values: ActivityLogFilterValueDto[],
  { onSearch, isLoading }: ValueFilterSearch,
): FilterProps => ({
  id: name,
  name,
  title,
  label: title,
  removable: true,
  searchable: true,
  loading: isLoading,
  search: {
    name: `${name}-search`,
    onChange: (event) => onSearch?.((event.target as HTMLInputElement).value),
    onClear: () => onSearch?.(''),
  },
  // The picker's own search box starts out empty each time it opens, so the lookup must too.
  onOpenChange: (open) => {
    if (!open) {
      onSearch?.('');
    }
  },
  items: values.map((value) => ({
    id: `${name}-${value.id}`,
    value: value.id,
    name,
    role: 'checkbox',
    label: value.name,
    searchWords: [value.name],
  })),
});

export const ActivityLogTabPanel = ({
  area,
  direction,
  onDirectionChange,
  reporteeName,
  filterState,
  onFilterStateChange,
  valueFilters,
  onValueFilterSearch,
  entries,
  isLoading = false,
  isError = false,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}: ActivityLogTabPanelProps) => {
  const { t } = useTranslation();
  const locale = getActivityLogLocale(useLanguageCode());

  const dateLabelPrefix = t('activity_log_page.filter_date');
  const hasActiveFilter = Object.values(filterState).some((values) => (values ?? []).length > 0);

  // The party filter is named for the side it applies to; the others for their field.
  const valueFilterLabel = (filter: ActivityLogValueFilterProps): string => {
    if (filter.name === ACTIVITY_LOG_PARTY_FILTER) {
      return direction === 'from'
        ? t('activity_log_page.filter_party_to')
        : t('activity_log_page.filter_party_from');
    }
    return t(`activity_log_page.filter_field.${filter.field}`);
  };
  const valueFilterOptions = useMemo(
    () =>
      Object.fromEntries(
        valueFilters.map((filter) => [filter.name, getActivityLogPartyOptions(filter.options)]),
      ),
    [valueFilters],
  );
  const toolbarValueFilters = valueFilters.map((filter) =>
    toValueFilter(filter.name, valueFilterLabel(filter), valueFilterOptions[filter.name], {
      onSearch: onValueFilterSearch && ((term) => onValueFilterSearch(filter.name, term)),
      isLoading: filter.isLoading,
    }),
  );
  const dateFilter: FilterProps = {
    id: ACTIVITY_LOG_DATE_FILTER,
    name: ACTIVITY_LOG_DATE_FILTER,
    title: dateLabelPrefix,
    label: dateLabelPrefix,
    removable: true,
    as: SelectDateFilter,
    items: [
      {
        id: `${ACTIVITY_LOG_DATE_FILTER}-picker`,
        name: 'datepicker',
        role: 'datepicker',
        icon: CalendarIcon,
        title: t('activity_log_page.filter_date_pick'),
        linkIcon: true,
      },
    ],
  };

  const getFilterLabel = (name: string, values?: (string | number)[]) => {
    if (name === ACTIVITY_LOG_DATE_FILTER) {
      return getActivityLogDateFilterLabel({
        prefix: dateLabelPrefix,
        fromDate: filterState.fromDate?.[0]?.toString(),
        toDate: filterState.toDate?.[0]?.toString(),
        locale,
        t,
      });
    }
    const filter = valueFilters.find((candidate) => candidate.name === name);
    return filter
      ? getActivityLogPartyFilterLabel(valueFilterLabel(filter), values, valueFilterOptions[name])
      : undefined;
  };

  return (
    <div className={classes.panel}>
      <FieldsetBase
        legend={t('activity_log_page.direction_legend')}
        className={classes.directionFieldset}
      >
        <RadioOptions
          name={`${area}-direction`}
          inline
          options={[
            {
              value: 'from',
              label: t('activity_log_page.direction_from'),
              checked: direction === 'from',
              onChange: () => onDirectionChange('from'),
            },
            {
              value: 'to',
              label: t('activity_log_page.direction_to'),
              checked: direction === 'to',
              onChange: () => onDirectionChange('to'),
            },
          ]}
        />
      </FieldsetBase>
      <Toolbar
        filter={{
          filterState,
          onFilterStateChange,
          addLabel: t('activity_log_page.add_filter'),
          addNextLabel: t('activity_log_page.add_another_filter'),
          removeLabel: t('activity_log_page.remove_filter'),
          resetLabel: t('activity_log_page.reset_filters'),
          getFilterLabel,
          filters: [...toolbarValueFilters, dateFilter],
        }}
      />
      {isError ? (
        <DsAlert
          data-color='danger'
          role='alert'
        >
          {t('activity_log_page.load_error')}
        </DsAlert>
      ) : (
        <ActivityLogTimeline
          direction={direction}
          reporteeName={reporteeName}
          entries={entries}
          isLoading={isLoading}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={onLoadMore}
          emptyState={
            <DsParagraph data-color='info'>
              {hasActiveFilter ? t('activity_log_page.no_results') : t('activity_log_page.empty')}
            </DsParagraph>
          }
        />
      )}
    </div>
  );
};
