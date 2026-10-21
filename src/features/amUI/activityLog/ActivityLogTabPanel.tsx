import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DsAlert,
  DsParagraph,
  FieldsetBase,
  type FilterState,
  RadioOptions,
  Toolbar,
} from '@altinn/altinn-components';

import type {
  ActivityLogArea,
  ActivityLogDirection,
  ActivityLogDto,
  ActivityLogFilterValueDto,
  ActivityTypeDto,
} from './types';
import { ACTIVITY_LOG_PARTY_FILTER } from './useActivityLogQueryState';
import { ActivityLogTimeline } from './ActivityLogTimeline';
import classes from './ActivityLogTabPanel.module.css';

export interface ActivityLogTabPanelProps {
  area: ActivityLogArea;
  direction: ActivityLogDirection;
  onDirectionChange: (direction: ActivityLogDirection) => void;
  /** Display name of the reportee the log is shown for. */
  reporteeName: string;
  /** The toolbar's filter state; the party filter is keyed by `ACTIVITY_LOG_PARTY_FILTER`. */
  filterState: FilterState;
  onFilterStateChange: (filterState: FilterState) => void;
  /** Parties to offer in the party filter, from `GET {area}/filter/to` (or `/from`). */
  partyOptions: ActivityLogFilterValueDto[];
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

export const ActivityLogTabPanel = ({
  area,
  direction,
  onDirectionChange,
  reporteeName,
  filterState,
  onFilterStateChange,
  partyOptions,
  entries,
  activityTypes,
  isLoading = false,
  isError = false,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}: ActivityLogTabPanelProps) => {
  const { t } = useTranslation();

  const partyLabelPrefix =
    direction === 'from'
      ? t('activity_log_page.filter_party_to')
      : t('activity_log_page.filter_party_from');
  const hasPartyFilter = (filterState[ACTIVITY_LOG_PARTY_FILTER] ?? []).length > 0;

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
          removeLabel: t('activity_log_page.remove_filter'),
          resetLabel: t('activity_log_page.reset_filters'),
          getFilterLabel: (name, values) => {
            if (name !== ACTIVITY_LOG_PARTY_FILTER) {
              return undefined;
            }
            const names = (values ?? [])
              .map((id) => partyOptions.find((party) => party.id === String(id))?.name)
              .filter(Boolean);
            return names.length > 0 ? `${partyLabelPrefix}: ${names.join(', ')}` : partyLabelPrefix;
          },
          filters: [
            {
              id: ACTIVITY_LOG_PARTY_FILTER,
              name: ACTIVITY_LOG_PARTY_FILTER,
              title: partyLabelPrefix,
              label: partyLabelPrefix,
              removable: true,
              items: partyOptions.map((party) => ({
                id: party.id,
                value: party.id,
                name: ACTIVITY_LOG_PARTY_FILTER,
                role: 'checkbox',
                label: party.name,
              })),
            },
          ],
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
          area={area}
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
              {hasPartyFilter ? t('activity_log_page.no_results') : t('activity_log_page.empty')}
            </DsParagraph>
          }
        />
      )}
    </div>
  );
};
