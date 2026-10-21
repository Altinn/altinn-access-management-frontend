import type { TFunction } from 'i18next';
import type { Color, LanguageCode } from '@altinn/altinn-components';

import type {
  ActivityLogArea,
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
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }
  return t('activity_log_page.timestamp', {
    date: date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }),
    time: date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }),
  });
};

/** Blue for access given, red for access taken away or requests turned down, neutral for the rest. */
export const getActivityLogColor = (entry: ActivityLogDto): Color => {
  if (entry.type === 'Request' && entry.trigger === 'Updated') {
    if (entry.status === 'Approved') {
      return 'company';
    }
    return entry.status === 'Rejected' || entry.status === 'Withdrawn' ? 'danger' : 'neutral';
  }
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

/** The thing the entry concerns (package, service, scope, instance or role), as a translated label. */
export const getActivityLogObjectLabel = (
  entry: ActivityLogDto,
  area: ActivityLogArea,
  t: TranslateFunction,
): string => {
  switch (entry.subtype) {
    case 'Package':
      return t(`${OBJECT_KEY}.package`, { name: entry.packageName ?? '' });
    case 'Resource':
      return t(`${OBJECT_KEY}.${area === 'maskinporten' ? 'scope' : 'resource'}`, {
        name: entry.resourceName ?? '',
      });
    case 'Instance':
      return t(`${OBJECT_KEY}.instance`, { name: entry.instanceId ?? '' });
    default:
      break;
  }
  switch (entry.type) {
    case 'Assignment':
      return t(`${OBJECT_KEY}.role`, { name: entry.roleName ?? '' });
    case 'Delegation':
      return t(`${OBJECT_KEY}.delegation`, { name: entry.viaRoleName ?? entry.roleName ?? '' });
    default:
      return t(`${OBJECT_KEY}.access`);
  }
};

/**
 * Candidate translation keys for the entry's event, most specific first:
 * `events.<type>.<trigger>_<status>` for request entries with a status, then `events.<type>.<trigger>`.
 */
export const getActivityLogEventKeys = (entry: ActivityLogDto): string[] => {
  const base = `${EVENTS_KEY}.${entry.type.toLowerCase()}.${entry.trigger.toLowerCase()}`;
  return entry.status ? [`${base}_${entry.status.toLowerCase()}`, base] : [base];
};

interface ActivityLogSentence {
  /** Key of the sentence describing what happened. */
  key: string;
  /** Key of the sentence naming who performed the change, when it is known. */
  byKey?: string;
  values: {
    reportee: string;
    counterpart: string;
    object: string;
    via: string;
    by: string;
    typeName: string;
  };
}

interface GetActivityLogSentenceParams {
  entry: ActivityLogDto;
  area: ActivityLogArea;
  direction: ActivityLogDirection;
  reporteeName: string;
  t: TranslateFunction;
  exists: (key: string) => boolean;
  activityTypes?: ActivityTypeDto[];
}

/** Resolves the sentence that describes an entry from the reportee's point of view. */
export const getActivityLogSentence = ({
  entry,
  area,
  direction,
  reporteeName,
  t,
  exists,
  activityTypes,
}: GetActivityLogSentenceParams): ActivityLogSentence => {
  const eventKey =
    getActivityLogEventKeys(entry).find((key) => exists(`${key}.${direction}`)) ??
    `${EVENTS_KEY}.fallback`;
  const catalogName = activityTypes?.find((type) => type.id === entry.activityTypeId)?.name;
  const byKey = `${eventKey}.by`;

  return {
    key: `${eventKey}.${direction}`,
    byKey: entry.byName && exists(byKey) ? byKey : undefined,
    values: {
      reportee: reporteeName,
      counterpart: getActivityLogCounterpart(entry, direction)?.name ?? '',
      object: getActivityLogObjectLabel(entry, area, t),
      via: entry.viaName ?? '',
      by: entry.byName ?? '',
      typeName: catalogName ?? `${entry.type} ${entry.trigger.toLowerCase()}`,
    },
  };
};
