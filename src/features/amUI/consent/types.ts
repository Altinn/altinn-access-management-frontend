export type ConsentLocale = 'nb' | 'nn' | 'en';
export type ConsentLanguage = Record<ConsentLocale, string>;

export interface ConsentRight {
  identifier: string;
  title: ConsentLanguage;
  consentTextHtml: ConsentLanguage;
}

export type ConsentRequestEventType =
  | 'Created'
  | 'Rejected'
  | 'Accepted'
  | 'Revoked'
  | 'Deleted'
  | 'Expired'
  | 'Used';
export interface ConsentRequestEvent {
  consentEventID: string;
  created: string;
  performedBy: string;
  eventType: ConsentRequestEventType;
  consentRequestID: string;
}

export interface ConsentRequest {
  id: string;
  rights: ConsentRight[];
  isPoa: boolean;
  title: ConsentLanguage;
  heading: ConsentLanguage;
  serviceIntro: ConsentLanguage;
  consentMessage?: ConsentLanguage;
  expiration: ConsentLanguage;
  handledBy?: ConsentLanguage;
  fromPartyName?: string;
  validTo: string;
  consentRequestEvents: ConsentRequestEvent[];
}

export interface ActiveConsentListItem {
  id: string;
  canBeConsented: boolean;
  isPoa: boolean;
  toPartyId: string;
  toPartyName: string;
}

export interface ConsentHistoryItem {
  id: string;
  isPoa: boolean;
  toPartyId: string;
  toPartyName: string;
  fromPartyId: string;
  fromPartyName: string;
  handledByPartyId: string;
  handledByPartyName: string;
  validTo: string;
  consentRequestEvents: ConsentRequestEvent[];
}

export interface Consent {
  id: string;
  rights: ConsentRight[];
  isPoa: boolean;
  titleAccepted: ConsentLanguage;
  serviceIntroAccepted: ConsentLanguage;
  consentMessage: ConsentLanguage;
  expiration: ConsentLanguage;
  handledBy?: ConsentLanguage;
  validTo: string;
  consentRequestEvents: ConsentRequestEvent[];
}

export interface ProblemDetail {
  code: string;
  detail: string;
  status: number;
  title: string;
  type: string;
}
