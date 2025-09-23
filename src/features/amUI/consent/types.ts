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

export interface ProblemDetail {
  code: string;
  detail: string;
  status: number;
  title: string;
  type: string;
}
