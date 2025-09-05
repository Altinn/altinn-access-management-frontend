import React, { useState } from 'react';
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
import { ConsentHistoryItem, ConsentRequestEventType } from '../types';
import { TFunction } from 'i18next';

interface ConsentTimelineProps {
  activeConsents: ConsentHistoryItem[];
  showConsentDetails: (consentId: string) => void;
}

export const ConsentTimeline = ({ activeConsents, showConsentDetails }: ConsentTimelineProps) => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState<string>('');

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchValue(event.target.value);
  };

  const timelineItems = getTimeLineItems(activeConsents, t).filter((item) => {
    const searchLower = searchValue.toLowerCase();
    return (
      item.fromPartyName?.toLowerCase().includes(searchLower) ||
      item.toPartyName?.toLowerCase().includes(searchLower)
    );
  });

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
        {activeConsents.length === 0 && (
          <DsParagraph data-color='info'>{t('consent_log.no_active_consents')}</DsParagraph>
        )}
        {searchValue && timelineItems.length === 0 && (
          <DsParagraph data-color='info'>{t('consent_log.no_results')}</DsParagraph>
        )}
        {timelineItems.map((item) => {
          return (
            <TimelineSegment
              data-color='company'
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
  return new Date(dateString).toLocaleDateString('no-NO', {
    day: '2-digit',
    month: useFullMonthName ? 'long' : '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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
  activeConsents: ConsentHistoryItem[],
  t: TFunction<'translation', undefined>,
): TimelineItem[] => {
  const getTimeLineText = (
    consent: ConsentHistoryItem,
    eventType: ConsentRequestEventType | 'Expired',
    t: TFunction<'translation', undefined>,
  ): string => {
    let textKey = `Ukjent hendelse ${eventType}`;
    if (eventType === 'Accepted') {
      textKey = consent.isPoa ? 'consent_log.poa_accepted' : 'consent_log.consent_accepted';
    }
    if (eventType === 'Revoked') {
      textKey = consent.isPoa ? 'consent_log.poa_revoked' : 'consent_log.consent_revoked';
    }
    if (eventType === 'Expired') {
      textKey = consent.isPoa ? 'consent_log.poa_expired' : 'consent_log.consent_expired';
    }

    return t(textKey, { to: consent.toPartyName, from: consent.fromPartyName });
  };

  return activeConsents
    .reduce((acc: TimelineItem[], consent) => {
      const consentTimelineItems = consent.consentRequestEvents
        .filter((event) => event.eventType === 'Accepted' || event.eventType === 'Revoked')
        .map((event) => {
          return {
            consentEventId: event.consentEventID,
            bylineText: toTimeStamp(event.created, true),
            timelineText: getTimeLineText(consent, event.eventType, t),
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

      if (new Date(consent.validTo) < new Date()) {
        consentTimelineItems.push({
          consentEventId: Math.random().toString(36).substring(2, 15), // Generate a unique ID for the expired event
          bylineText: toTimeStamp(consent.validTo, true),
          timelineText: getTimeLineText(consent, 'Expired', t),
          validToText: '',
          created: consent.validTo,
          fromPartyName: consent.fromPartyName,
          toPartyName: consent.toPartyName,
          isPoa: consent.isPoa,
          consentId: consent.id,
        });
      }

      return [...acc, ...consentTimelineItems];
    }, [])
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
};
