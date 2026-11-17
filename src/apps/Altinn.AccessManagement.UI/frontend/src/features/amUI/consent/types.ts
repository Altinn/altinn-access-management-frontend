import type { PartyEntity } from '@/dataObjects/dtos/Party';

export type ConsentLocale = 'nb' | 'nn' | 'en';
export type ConsentLanguage = Record<ConsentLocale, string>;

export interface ConsentRight {
  identifier: string;
  title: ConsentLanguage;
  consentTextHtml: ConsentLanguage;
}

export type ConsentRequestEventType =
  'Created' | 'Rejected' | 'Accepted' | 'Revoked' | 'Deleted' | 'Expired' | 'Used';
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
  fromParty: PartyEntity;
  toParty: PartyEntity;
  handledByParty?: PartyEntity;
  validTo: string;
  consentRequestEvents: ConsentRequestEvent[];
}

export interface ActiveConsentListItem {
  id: string;
  isPendingConsent: boolean;
  isPoa: boolean;
  fromParty: PartyEntity;
  toParty: PartyEntity;
  createdDate: string;
  consentedDate?: string;
}

export interface ConsentHistoryItem {
  id: string;
  isPoa: boolean;
  fromParty: PartyEntity;
  toParty: PartyEntity;
  handledByParty?: PartyEntity;
  validTo: string;
  consentRequestEvents: ConsentRequestEvent[];
}

export interface Consent {
  id: string;
  rights: ConsentRight[];
  isPoa: boolean;
  titleAccepted: ConsentLanguage;
  serviceIntroAccepted: ConsentLanguage;
  consentMessage?: ConsentLanguage;
  expiration: ConsentLanguage;
  handledBy?: ConsentLanguage;
  validTo: string;
  consentRequestEvents: ConsentRequestEvent[];
  fromParty: PartyEntity;
  toParty: PartyEntity;
  handledByParty?: PartyEntity;
}

export interface ProblemDetail {
  code: string;
  detail: string;
  status: number;
  title: string;
  type: string;
}
