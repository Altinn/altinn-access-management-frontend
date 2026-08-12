import type {
  Consent,
  ConsentLanguage,
  ConsentLocale,
  ConsentRequest,
  ConsentRequestEvent,
  ConsentRequestEventType,
} from './types';

export const getLanguage = (language: string | null): keyof ConsentLanguage => {
  switch (language) {
    case 'no_nb':
      return 'nb';
    case 'no_nn':
      return 'nn';
    case 'en':
      return 'en';
  }
  return 'nb'; // Default to Norwegian if no cookie is set
};

const hasConsentEvents = (
  events: ConsentRequestEvent[],
  eventTypes: ConsentRequestEventType[],
): boolean => {
  return events.some((e) => eventTypes.includes(e.eventType));
};

export const isExpired = (events: ConsentRequestEvent[]): boolean => {
  return hasConsentEvents(events, ['Expired']);
};

export const isAccepted = (events: ConsentRequestEvent[]): boolean => {
  return hasConsentEvents(events, ['Accepted']);
};

export const isRevoked = (events: ConsentRequestEvent[]): boolean => {
  return hasConsentEvents(events, ['Revoked', 'Deleted', 'Rejected']);
};

export const canConsentBeRevoked = (events: ConsentRequestEvent[]) => {
  const hasTerminalEvent = isRevoked(events) || isExpired(events);
  return isAccepted(events) && !hasTerminalEvent;
};

/**
 * Parses a raw userAgent string into readable browser and OS names.
 * Returns `undefined` for a part that couldn't be determined.
 * Order matters: more specific tokens must be checked before generic ones
 * (e.g. Edge/Opera before Chrome, since they also contain "Chrome").
 */
export const parseUserAgent = (
  userAgent: string | undefined | null,
): { browser?: string; os?: string } => {
  if (!userAgent) {
    return {};
  }

  const getBrowser = (): string | undefined => {
    if (/Edg(?:e|A|iOS)?\//.test(userAgent)) return 'Microsoft Edge';
    if (/OPR\/|Opera/.test(userAgent)) return 'Opera';
    if (/SamsungBrowser\//.test(userAgent)) return 'Samsung Internet';
    if (/Firefox\/|FxiOS\//.test(userAgent)) return 'Firefox';
    if (/Chrome\/|CriOS\//.test(userAgent)) return 'Chrome';
    // Safari must be checked last: Chrome/Edge/Opera UAs also contain "Safari".
    if (/Safari\//.test(userAgent)) return 'Safari';
    return undefined;
  };

  const getOs = (): string | undefined => {
    if (/Windows/.test(userAgent)) return 'Windows';
    if (/iPhone|iPad|iPod/.test(userAgent)) return 'iOS';
    if (/Android/.test(userAgent)) return 'Android';
    if (/Mac OS X|Macintosh/.test(userAgent)) return 'macOS';
    if (/Linux/.test(userAgent)) return 'Linux';
    return undefined;
  };

  return { browser: getBrowser(), os: getOs() };
};

export const toDateTimeString = (dateString: string, useFullMonthName?: boolean) => {
  return new Date(dateString).toLocaleString('no-NO', {
    day: '2-digit',
    month: useFullMonthName ? 'long' : '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

type KeysWithValueOfConsentLanguageOrUndefined<T> = {
  [K in keyof T]: T[K] extends ConsentLanguage | undefined ? K : never;
}[keyof T];
interface ConsentMetadataValues {
  CoveredBy: string;
  OfferedBy: string;
  HandledBy: string;
  Expiration: string;
}
export const replaceStaticMetadata = <T extends ConsentRequest | Consent>(
  consent: T,
  replaceFields: KeysWithValueOfConsentLanguageOrUndefined<T>[],
): T => {
  const metadata: ConsentMetadataValues = {
    CoveredBy: consent.toParty.name,
    OfferedBy: consent.fromParty.name,
    HandledBy: consent.handledByParty?.name ?? '',
    Expiration: consent.validTo ? toDateTimeString(consent.validTo) : '',
  };

  const result = { ...consent };
  for (const field of replaceFields) {
    const value = consent[field] as ConsentLanguage | undefined;
    result[field] = replaceMetadata(value, metadata) as T[typeof field];
  }

  return result;
};

const replaceMetadata = (
  texts: ConsentLanguage | undefined,
  metadata: ConsentMetadataValues,
): ConsentLanguage | undefined => {
  if (!texts) {
    return texts;
  }
  const returnObj = { ...texts };
  // loop through each language
  for (const language of Object.keys(texts)) {
    const lang = language as ConsentLocale;
    let replaced = texts[lang];
    // loop through all static metadata values
    for (const metadataKey of Object.keys(metadata)) {
      const key = metadataKey as keyof ConsentMetadataValues;
      replaced = replaced.replaceAll(`{${key}}`, metadata[key]);
    }

    returnObj[lang] = replaced;
  }

  return returnObj;
};
