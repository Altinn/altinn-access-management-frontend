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
  ActivityTypeDto,
} from './types';
import {
  ACTIVITY_LOG_BY_FILTER,
  ACTIVITY_LOG_DATE_FILTER,
  ACTIVITY_LOG_PARTY_FILTER,
} from './useActivityLogQueryState';
import {
  getActivityLogDateFilterLabel,
  getActivityLogLocale,
  getActivityLogPartyFilterLabel,
  getActivityLogPartyOptions,
} from './activityLogUtils';
import { ActivityLogTimeline } from './ActivityLogTimeline';
import classes from './ActivityLogTabPanel.module.css';

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
   * Parties to offer in the party filter, from `GET {area}/filter/to` (or `/from`). May hold several
   * names for one id (a renamed party); they are folded into one option.
   */
  partyOptions: ActivityLogFilterValueDto[];
  /** Users and systems to offer in the "performed by" filter, from `GET {area}/filter/by`. */
  byOptions: ActivityLogFilterValueDto[];
  /** Entries as returned by the API for the current direction and filter, newest first. */
  entries: ActivityLogDto[];
  /** The area's catalog (`GET {area}/types`). */
  activityTypes?: ActivityTypeDto[];
  isLoading?: boolean;
  isError?: boolean;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

const FILTER_NAMES = [ACTIVITY_LOG_PARTY_FILTER, ACTIVITY_LOG_BY_FILTER, ACTIVITY_LOG_DATE_FILTER];

/** A searchable multi-select over (id, name) pairs, for the party and "performed by" filters. */
const toValueFilter = (
  name: string,
  title: string,
  values: ActivityLogFilterValueDto[],
): FilterProps => ({
  id: name,
  name,
  title,
  label: title,
  removable: true,
  searchable: true,
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
  partyOptions,
  byOptions,
  entries,
  activityTypes,
  isLoading = false,
  isError = false,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}: ActivityLogTabPanelProps) => {
  const { t } = useTranslation();
  const locale = getActivityLogLocale(useLanguageCode());

  const partyLabelPrefix =
    direction === 'from'
      ? t('activity_log_page.filter_party_to')
      : t('activity_log_page.filter_party_from');
  const byLabelPrefix = t('activity_log_page.filter_by');
  const dateLabelPrefix = t('activity_log_page.filter_date');
  const hasActiveFilter = FILTER_NAMES.some((name) => (filterState[name] ?? []).length > 0);

  const partyFilterOptions = useMemo(
    () => getActivityLogPartyOptions(partyOptions),
    [partyOptions],
  );
  const byFilterOptions = useMemo(() => getActivityLogPartyOptions(byOptions), [byOptions]);

  const partyFilter = toValueFilter(
    ACTIVITY_LOG_PARTY_FILTER,
    partyLabelPrefix,
    partyFilterOptions,
  );
  const byFilter = toValueFilter(ACTIVITY_LOG_BY_FILTER, byLabelPrefix, byFilterOptions);
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
    switch (name) {
      case ACTIVITY_LOG_PARTY_FILTER:
        return getActivityLogPartyFilterLabel(partyLabelPrefix, values, partyFilterOptions);
      case ACTIVITY_LOG_BY_FILTER:
        return getActivityLogPartyFilterLabel(byLabelPrefix, values, byFilterOptions);
      case ACTIVITY_LOG_DATE_FILTER:
        return getActivityLogDateFilterLabel({
          prefix: dateLabelPrefix,
          fromDate: filterState.fromDate?.[0]?.toString(),
          toDate: filterState.toDate?.[0]?.toString(),
          locale,
          t,
        });
      default:
        return undefined;
    }
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
          filters: [partyFilter, byFilter, dateFilter],
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
          activityTypes={activityTypes}
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
