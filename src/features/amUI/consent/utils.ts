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

interface ConsentMetadataValues {
  CoveredBy: string;
  OfferedBy: string;
  HandledBy: string;
  Expiration: string;
}
export const replaceRequestStaticMetadata = (consentRequest: ConsentRequest) => {
  const staticMetadata: ConsentMetadataValues = {
    CoveredBy: consentRequest.toPartyName,
    OfferedBy: consentRequest.fromPartyName,
    HandledBy: consentRequest.handledByPartyName,
    Expiration: consentRequest.validTo ? toDateTimeString(consentRequest.validTo) : '',
  };
  return {
    ...consentRequest,
    title: replaceMetadata(consentRequest.title, staticMetadata),
    heading: replaceMetadata(consentRequest.heading, staticMetadata),
    serviceIntro: replaceMetadata(consentRequest.serviceIntro, staticMetadata),
    consentMessage: consentRequest.consentMessage
      ? replaceMetadata(consentRequest.consentMessage, staticMetadata)
      : consentRequest.consentMessage,
    expiration: replaceMetadata(consentRequest.expiration, staticMetadata),
    handledBy: consentRequest.handledBy
      ? replaceMetadata(consentRequest.handledBy, staticMetadata)
      : consentRequest.handledBy,
  };
};

export const replaceConsentStaticMetadata = (consent: Consent) => {
  const staticMetadata: ConsentMetadataValues = {
    CoveredBy: consent.toPartyName,
    OfferedBy: consent.fromPartyName,
    HandledBy: consent.handledByPartyName,
    Expiration: consent.validTo ? toDateTimeString(consent.validTo) : '',
  };
  return {
    ...consent,
    titleAccepted: replaceMetadata(consent.titleAccepted, staticMetadata),
    serviceIntroAccepted: replaceMetadata(consent.serviceIntroAccepted, staticMetadata),
    consentMessage: consent.consentMessage
      ? replaceMetadata(consent.consentMessage, staticMetadata)
      : consent.consentMessage,
    expiration: replaceMetadata(consent.expiration, staticMetadata),
    handledBy: consent.handledBy
      ? replaceMetadata(consent.handledBy, staticMetadata)
      : consent.handledBy,
  };
};

const replaceMetadata = (
  texts: ConsentLanguage,
  metadata: ConsentMetadataValues,
): ConsentLanguage => {
  const returnObj = { ...texts };
  // loop through each language
  Object.keys(texts).forEach((language) => {
    const lang = language as ConsentLocale;
    let replaced = texts[lang];
    // loop through all static metadata values
    Object.keys(metadata).forEach((metadataKey) => {
      const key = metadataKey as keyof ConsentMetadataValues;
      replaced = replaced.replace(`{${key}}`, metadata[key]);
    });
    returnObj[lang] = replaced;
  });

  return returnObj;
};
