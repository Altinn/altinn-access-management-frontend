import type { TFunction } from 'i18next';
import type { Color, LanguageCode } from '@altinn/altinn-components';

import type {
  ActivityLogDirection,
  ActivityLogDto,
  ActivityLogFilterValueDto,
  ActivityTypeDto,
} from './types';

type TranslateFunction = TFunction<'translation', undefined>;

const EVENTS_KEY = 'activity_log_page.events';
const OBJECT_KEY = 'activity_log_page.object';

const localeByLanguage: Record<LanguageCode, string> = {
  nb: 'nb-NO',
  nn: 'nn-NO',
  en: 'en-GB',
};

/** The BCP 47 locale to format dates with for the current UI language. */
export const getActivityLogLocale = (language: LanguageCode): string =>
  localeByLanguage[language] ?? localeByLanguage.nb;

export const formatActivityLogTimestamp = (
  timestamp: string,
  t: TranslateFunction,
  locale = localeByLanguage.nb,
): string => {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return timestamp;
  }
  return t('activity_log_page.timestamp', {
    date: date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }),
    time: date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }),
  });
};

/** Blue for access given, red for access taken away, neutral for the rest. */
export const getActivityLogColor = (entry: ActivityLogDto): Color => {
  switch (entry.trigger) {
    case 'Created':
      return 'company';
    case 'Deleted':
      return 'danger';
    default:
      return 'neutral';
  }
};

/** The other party in the entry: the receiver when the reportee gave access, the giver when it received. */
export const getActivityLogCounterpart = (
  entry: ActivityLogDto,
  direction: ActivityLogDirection,
): ActivityLogFilterValueDto | undefined => {
  const id = direction === 'from' ? entry.toId : entry.fromId;
  const name = direction === 'from' ? entry.toName : entry.fromName;
  return id && name ? { id, name } : undefined;
};

/** The thing the entry concerns, as a translated label: the scope for scope entries, else the role. */
export const getActivityLogObjectLabel = (entry: ActivityLogDto, t: TranslateFunction): string => {
  if (entry.subtype === 'Resource') {
    return t(`${OBJECT_KEY}.scope`, { name: entry.resourceName ?? '' });
  }
  return entry.roleName
    ? t(`${OBJECT_KEY}.role`, { name: entry.roleName })
    : t(`${OBJECT_KEY}.access`);
};

/** The translation key for the entry's event: `events.<type>.<trigger>`. */
export const getActivityLogEventKey = (entry: ActivityLogDto): string =>
  `${EVENTS_KEY}.${entry.type.toLowerCase()}.${entry.trigger.toLowerCase()}`;

interface ActivityLogSentence {
  /** Key of the sentence describing what happened. */
  key: string;
  /** Key of the sentence naming who performed the change, when it is known. */
  byKey?: string;
  values: {
    reportee: string;
    counterpart: string;
    object: string;
    by: string;
    typeName: string;
  };
}

interface GetActivityLogSentenceParams {
  entry: ActivityLogDto;
  direction: ActivityLogDirection;
  /** Display name of the reportee the log is shown for. */
  reporteeName: string;
  t: TranslateFunction;
  /** Whether a translation key exists, normally `i18n.exists`. */
  exists: (key: string) => boolean;
  /** The area's catalog, used to name events without a sentence template. */
  activityTypes?: ActivityTypeDto[];
}

/** Resolves the sentence that describes an entry from the reportee's point of view. */
export const getActivityLogSentence = ({
  entry,
  direction,
  reporteeName,
  t,
  exists,
  activityTypes,
}: GetActivityLogSentenceParams): ActivityLogSentence => {
  const candidateKey = getActivityLogEventKey(entry);
  const eventKey = exists(`${candidateKey}.${direction}`) ? candidateKey : `${EVENTS_KEY}.fallback`;
  const catalogName = activityTypes?.find((type) => type.id === entry.activityTypeId)?.name;
  const byKey = `${eventKey}.by`;

  return {
    key: `${eventKey}.${direction}`,
    byKey: entry.byName && exists(byKey) ? byKey : undefined,
    values: {
      reportee: reporteeName,
      counterpart: getActivityLogCounterpart(entry, direction)?.name ?? '',
      object: getActivityLogObjectLabel(entry, t),
      by: entry.byName ?? '',
      typeName: catalogName ?? `${entry.type} ${entry.trigger.toLowerCase()}`,
    },
  };
};
