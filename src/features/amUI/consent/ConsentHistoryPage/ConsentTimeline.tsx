import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DsParagraph,
  DsSearch,
  Timeline,
  TimelineActivity,
  TimelineSegment,
} from '@altinn/altinn-components';
import classes from './ConsentHistoryPage.module.css';
import { ConsentHistoryItem } from '../types';
import { TFunction } from 'i18next';
import { useGetReporteeQuery } from '@/rtk/features/userInfoApi';

interface ConsentTimelineProps {
  consentLog: ConsentHistoryItem[];
  showConsentDetails: (consentId: string) => void;
}

export const ConsentTimeline = ({ consentLog, showConsentDetails }: ConsentTimelineProps) => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState<string>('');
  const { data: reportee } = useGetReporteeQuery();

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchValue(event.target.value);
  };

  const timeLineItems = useMemo(() => getTimeLineItems(consentLog, t), [consentLog, t]);
  const filteredTimelineItems = useMemo(
    () =>
      timeLineItems.filter((item) => {
        const q = searchValue.trim().toLowerCase();
        return [item.fromPartyName, item.toPartyName].some((name) =>
          name?.toLowerCase().includes(q),
        );
      }),
    [searchValue, timeLineItems],
  );

  return (
    <>
      <DsSearch className={classes.consentSearchField}>
        <DsSearch.Input
          placeholder={t('consent_log.search_log')}
          aria-label={t('consent_log.search_log')}
          value={searchValue}
          onChange={handleSearch}
        />
        <DsSearch.Clear />
      </DsSearch>
      <Timeline>
        {!searchValue && timeLineItems.length === 0 && (
          <DsParagraph data-color='info'>{t('consent_log.no_active_consents')}</DsParagraph>
        )}
        {searchValue && filteredTimelineItems.length === 0 && (
          <DsParagraph data-color='info'>{t('consent_log.no_results')}</DsParagraph>
        )}
        {filteredTimelineItems.map((item) => {
          return (
            <TimelineSegment
              data-color={reportee?.type === 'Person' ? 'person' : 'company'}
              borderColor={reportee?.type === 'Person' ? 'person' : 'company'}
              key={item.consentEventId}
            >
              <TimelineActivity byline={item.bylineText}>
                <div className={classes.timelineContent}>
                  <DsParagraph
                    data-size='md'
                    className={classes.timelineTitle}
                  >
                    {item.timelineText}
                  </DsParagraph>
                  {item.validToText && <DsParagraph data-size='xs'>{item.validToText}</DsParagraph>}
                  <span>
                    <Button
                      size='xs'
                      variant='dotted'
                      onClick={() => showConsentDetails(item.consentId)}
                    >
                      {item.isPoa ? t('consent_log.view_poa') : t('consent_log.view_consent')}
                    </Button>
                  </span>
                </div>
              </TimelineActivity>
            </TimelineSegment>
          );
        })}
      </Timeline>
    </>
  );
};

const toTimeStamp = (dateString: string, useFullMonthName?: boolean): string => {
  return new Date(dateString).toLocaleString('no-NO', {
    day: '2-digit',
    month: useFullMonthName ? 'long' : '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const timelineEventText = {
  Accepted: {
    poa: 'consent_log.poa_accepted',
    consent: 'consent_log.consent_accepted',
  },
  Revoked: {
    poa: 'consent_log.poa_revoked',
    consent: 'consent_log.consent_revoked',
  },
  Expired: {
    poa: 'consent_log.poa_expired',
    consent: 'consent_log.consent_expired',
  },
  Used: {
    poa: 'consent_log.poa_used',
    consent: 'consent_log.consent_used',
  },
};

interface TimelineItem {
  consentEventId: string;
  created: string;
  bylineText: string;
  timelineText: string;
  validToText: string;
  fromPartyName?: string;
  toPartyName?: string;
  isPoa: boolean;
  consentId: string;
}
const getTimeLineItems = (
  consentLog: ConsentHistoryItem[],
  t: TFunction<'translation', undefined>,
): TimelineItem[] => {
  const getTimeLineText = (
    consent: ConsentHistoryItem,
    eventType: keyof typeof timelineEventText,
    t: TFunction<'translation', undefined>,
  ): string => {
    const textKey = consent.isPoa
      ? timelineEventText[eventType]['poa']
      : timelineEventText[eventType]['consent'];
    return t(textKey, { to: consent.toPartyName, from: consent.fromPartyName });
  };

  return consentLog
    .reduce((acc: TimelineItem[], consent) => {
      const consentTimelineItems = consent.consentRequestEvents
        .filter((event) => Object.keys(timelineEventText).includes(event.eventType))
        .map((event) => {
          return {
            consentEventId: event.consentEventID,
            bylineText: toTimeStamp(event.created, true),
            timelineText: getTimeLineText(
              consent,
              event.eventType as keyof typeof timelineEventText,
              t,
            ),
            validToText:
              event.eventType === 'Accepted'
                ? t('consent_log.expires', { expires: toTimeStamp(consent.validTo) })
                : '',
            created: event.created,
            fromPartyName: consent.fromPartyName,
            toPartyName: consent.toPartyName,
            isPoa: consent.isPoa,
            consentId: consent.id,
          };
        });

      return [...acc, ...consentTimelineItems];
    }, [])
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
};
