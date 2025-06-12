export type ConsentLanguage = {
  nb: string;
  nn: string;
  en: string;
};

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
  consentMessage: ConsentLanguage;
  expiration: ConsentLanguage;
  handledBy?: ConsentLanguage;
  fromPartyName?: string;
}

export interface ActiveConsentListItem {
  id: string;
  toPartyId: string;
  toPartyName: string;
}

export interface Consent {
  id: string;
  rights: ConsentRight[];
  isPoa: boolean;
  serviceIntroAccepted: ConsentLanguage;
  consentMessage: ConsentLanguage;
  expiration: ConsentLanguage;
  handledBy?: ConsentLanguage;
  toPartyName: string;
}

export interface ProblemDetail {
  code: string;
  detail: string;
  status: number;
  title: string;
  type: string;
}
