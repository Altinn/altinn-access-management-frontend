import type { ConsentLanguage, ConsentRequestEvent, ConsentRequestEventType } from './types';

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
