import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  Button,
  DsParagraph,
  Timeline,
  TimelineActivity,
  TimelineSegment,
} from '@altinn/altinn-components';

import { useLanguageCode } from '@/resources/hooks/useLanguageCode';

import type {
  ActivityLogArea,
  ActivityLogDirection,
  ActivityLogDto,
  ActivityTypeDto,
} from './types';
import {
  formatActivityLogTimestamp,
  getActivityLogColor,
  getActivityLogLocale,
  getActivityLogSentence,
} from './activityLogUtils';
import classes from './ActivityLogTimeline.module.css';

interface ActivityLogTimelineProps {
  area: ActivityLogArea;
  direction: ActivityLogDirection;
  /** Display name of the reportee the log is shown for. */
  reporteeName: string;
  /** Entries as returned by the API, newest first. */
  entries: ActivityLogDto[];
  /** The area's catalog (`GET {area}/types`), used to name events without a sentence template. */
  activityTypes?: ActivityTypeDto[];
  isLoading?: boolean;
  /** Whether more entries can be fetched with `onLoadMore`. */
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  /** Shown when there are no entries to display. */
  emptyState?: React.ReactNode;
}

export const ActivityLogTimeline = ({
  area,
  direction,
  reporteeName,
  entries,
  activityTypes,
  isLoading = false,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  emptyState,
}: ActivityLogTimelineProps) => {
  const { t, i18n } = useTranslation();
  const locale = getActivityLogLocale(useLanguageCode());

  if (isLoading) {
    return <ActivityLogTimelineSkeleton />;
  }

  if (entries.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <div className={classes.timeline}>
      <Timeline>
        {entries.map((entry) => {
          const color = getActivityLogColor(entry);
          const sentence = getActivityLogSentence({
            entry,
            area,
            direction,
            reporteeName,
            t,
            exists: (key) => i18n.exists(key),
            activityTypes,
          });
          return (
            <TimelineSegment
              key={entry.id}
              data-color={color}
              borderColor={color}
              datetime={entry.when}
              byline={formatActivityLogTimestamp(entry.when, t, locale)}
            >
              <TimelineActivity>
                <DsParagraph
                  data-size='sm'
                  className={classes.entryText}
                >
                  <Trans
                    i18nKey={sentence.key}
                    values={sentence.values}
                    components={[
                      <span
                        key='counterpart'
                        className={classes.partyName}
                      />,
                    ]}
                  />
                  {sentence.byKey && <> {t(sentence.byKey, sentence.values)}</>}
                </DsParagraph>
              </TimelineActivity>
            </TimelineSegment>
          );
        })}
      </Timeline>
      {hasMore && (
        <div className={classes.loadMore}>
          <Button
            variant='outline'
            onClick={onLoadMore}
            loading={isLoadingMore}
            disabled={isLoadingMore}
          >
            {t('activity_log_page.load_more')}
          </Button>
        </div>
      )}
    </div>
  );
};

const ActivityLogTimelineSkeleton = () => (
  <Timeline>
    {[0, 1, 2].map((index) => (
      <TimelineSegment
        key={index}
        loading
        byline='xxxxxxxxxxxxxxxxxxxxx'
      >
        <TimelineActivity loading>
          xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        </TimelineActivity>
      </TimelineSegment>
    ))}
  </Timeline>
);
