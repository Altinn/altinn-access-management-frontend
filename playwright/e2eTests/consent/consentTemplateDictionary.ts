// consentDictionary.ts

import { Language } from 'playwright/pages/consent/ConsentPage';

export const DICTIONARIES = {
  [Language.NB]: {
    approve: 'Jeg gir samtykke',
    reject: 'Jeg gir ikke samtykke',
    approve_poa: 'Godkjenn fullmakt',
    reject_poa: 'Jeg gir ikke fullmakt',
    consent_requests: 'Samtykkeforespørsler',
    heading_krav: 'Godkjenne deling med banken',
    heading_fullmakt: 'Fullmakt til å handle på dine vegne',
    standard_lead: 'ønsker å hente opplysninger om deg',
    standard_detail: 'Ved at du samtykker, får …',
    krav_lead: 'Skatteetaten har utviklet en løsning',
    user_access: 'Brukerstyrt tilgang',
    fullmakt_intro: 'Ved at du gir fullmakt, får …',
    enkelt_lead: 'ber om ditt samtykke',
    enkelt_bullet_intro: 'Ved å godkjenne denne forespørselen samtykker du …',
    enkelt_label: 'Enkelt samtykke',
  },
  [Language.EN]: {
    approve: 'I give consent',
    reject: "I don't give consent",
    approve_poa: 'Approve power of attorney',
    reject_poa: "I don't give power of attorney",
    consent_requests: 'Consent requests',
    heading_krav: 'Consent to sharing with the bank',
    heading_fullmakt: 'Power of attorney to act on your behalf',
    standard_lead: 'wants to retrieve information about you',
    standard_detail: 'By giving consent, you grant access to …',
    krav_lead: 'The Tax Administration has developed a solution',
    user_access: 'User-controlled access',
    fullmakt_intro: 'By giving power of attorney, you grant access to …',
    enkelt_lead: 'requests your consent',
    enkelt_bullet_intro: 'By approving this request you consent to …',
    enkelt_label: 'Single consent',
  },
  // add NN…
} as const;
