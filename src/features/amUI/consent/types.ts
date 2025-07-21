export type ConsentLocale = 'nb' | 'nn' | 'en';
export type ConsentLanguage = Record<ConsentLocale, string>;

export interface ConsentRight {
  identifier: string;
  title: ConsentLanguage;
  consentTextHtml: ConsentLanguage;
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
  consentRequestEvents: {
    consentEventID: string;
    created: string;
    performedBy: string;
    eventType: string;
    consentRequestID: string;
  }[];
}

export interface ActiveConsentListItem {
  id: string;
  toPartyId: string;
  toPartyName: string;
}

export type ConsentStatus = 'Created' | 'Rejected' | 'Accepted' | 'Revoked' | 'Deleted';
export interface Consent {
  id: string;
  rights: ConsentRight[];
  isPoa: boolean;
  titleAccepted: ConsentLanguage;
  serviceIntroAccepted: ConsentLanguage;
  consentMessage: ConsentLanguage;
  expiration: ConsentLanguage;
  handledBy?: ConsentLanguage;
  status: ConsentStatus;
}

export interface ProblemDetail {
  code: string;
  detail: string;
  status: number;
  title: string;
  type: string;
}
