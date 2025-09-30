import type { ReporteeInfo } from '@/rtk/features/userInfoApi';
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

export const hasConsentPermission = (
  reportee?: ReporteeInfo,
  isAdmin: boolean = false,
): boolean => {
  return reportee?.type === 'Person' || (reportee?.type === 'Organization' && isAdmin);
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
    CoveredBy: consent.toPartyName,
    OfferedBy: consent.fromPartyName,
    HandledBy: consent.handledByPartyName,
    Expiration: consent.validTo ? toDateTimeString(consent.validTo) : '',
  };

  const result = { ...consent };
  replaceFields.forEach((field) => {
    const value = consent[field] as ConsentLanguage | undefined;
    result[field] = replaceMetadata(value, metadata) as T[typeof field];
  });
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
