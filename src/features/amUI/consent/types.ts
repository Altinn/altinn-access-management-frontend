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
  handledBy: ConsentLanguage;
  partyName?: string;
}

export interface ProblemDetail {
  code: string;
  detail: string;
  status: number;
  title: string;
  type: string;
}
