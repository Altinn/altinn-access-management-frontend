import type { Page, Locator } from '@playwright/test';

import { expect } from '@playwright/test';
import en from '../../../src/localizations/en.json';
import nn from '../../../src/localizations/no_nn.json';
import no_nb from '@/localizations/no_nb.json';

export enum Language {
  NB = 'NB',
  EN = 'EN',
  NN = 'NN',
}

const DICTIONARIES = {
  [Language.NB]: no_nb,
  [Language.EN]: en,
  [Language.NN]: nn,
} as const satisfies Record<Language, any>;

export class ConsentPage {
  readonly page: Page;
  readonly language: Language;

  // Links and buttons
  readonly linkAltinn: Locator;
  readonly buttonApprove: Locator;
  readonly buttonReject: Locator;
  readonly buttonFullmaktApprove: Locator;
  readonly buttonFullmaktReject: Locator;
  readonly languagePicker: Locator;
  readonly norwegian: Locator;
  readonly nynorsk: Locator;
  readonly english: Locator;

  // Headings
  readonly standardHeading: Locator;
  readonly headingKrav: Locator;
  readonly headingFullmakt: Locator;

  // Standard intro text chunks
  readonly textStandardLead: Locator;
  readonly textStandardDetail: Locator;

  // Krav intro text chunks
  readonly textKravLead: Locator;
  readonly textUserAccess: Locator; // Brukerstyrt tilgang

  // Fullmakt intro text chunks
  readonly textFullmaktIntro: Locator;

  // Enkelt samtykke chunks
  readonly textEnkeltLead: Locator;
  readonly textEnkeltBulletIntro: Locator;
  readonly textEnkeltLabel: Locator;

  // Income data text
  readonly textIncomeData: Locator;

  // Fullmakt service text
  readonly textFullmaktService: Locator;

  // Fullmakt expiry text
  readonly textFullmaktExpiry: Locator;

  // Fullmakt heading text
  readonly textFullmaktHeading: Locator;

  // Loan application text
  readonly textLoanApplication: Locator;

  // One-time delivery text
  readonly textOneTimeDelivery: Locator;

  // Loan metadata text
  readonly textInterestRate: Locator;
  readonly textExpirationYear: Locator;
  readonly textBankName: Locator;

  // Simple consent text
  readonly textDataUsage: Locator;
  readonly textDataProtection: Locator;
  readonly textOneTimeUse: Locator;

  // Income year text
  readonly textIncomeYear: Locator;

  // Consent request heading
  readonly textConsentRequestHeading: Locator;

  // Used for selecting language files
  private languageDictionary: any;

  //Default language to Norwegian
  constructor(page: Page, language: Language) {
    this.page = page;
    this.languageDictionary = DICTIONARIES[language];
    this.language = language; // now the fixture value wins

    // Controls/links
    this.languagePicker = page.getByRole('button', { name: /language/i });
    this.norwegian = page.locator('a', { hasText: 'Norsk (bokmål)' });
    this.english = page.locator('a', { hasText: 'English' });
    this.nynorsk = page.locator('a', { hasText: 'Nynorsk' });
    this.linkAltinn = page.getByRole('link', { name: /altinn\.no/i });
    // Language-specific button selectors
    const buttonTexts = {
      [Language.EN]: {
        approve: /yes, i give consent/i,
        reject: /no, i do not give consent/i,
      },
      [Language.NB]: {
        approve: /jeg gir samtykke/i,
        reject: /jeg gir ikke samtykke/i,
      },
      [Language.NN]: {
        approve: /Ja, eg gir samtykke/i,
        reject: /Nei, eg gir ikkje samtykke/i,
      },
    };

    const texts = buttonTexts[language];
    this.buttonApprove = page.getByRole('button', { name: texts.approve });
    this.buttonReject = page.getByRole('button', { name: texts.reject });

    this.buttonFullmaktApprove = page.getByRole('button', {
      name: this.languageDictionary.consent_request.approve_poa,
    });

    // Fullmakt reject button - language specific
    const fullmaktRejectTexts = {
      [Language.NN]: /jeg gir ikkje fullmakt/i,
      [Language.NB]: /jeg gir ikke fullmakt/i,
      [Language.EN]: /I do not give power of attorney/i,
    };
    this.buttonFullmaktReject = page.getByRole('button', {
      name: fullmaktRejectTexts[language] || fullmaktRejectTexts[Language.NB],
    });

    // Headings (use exact text when stable, regex when copy may drift)
    this.standardHeading = page.getByRole('heading', {
      name: this.languageDictionary.consent_requests,
    });

    // Headings - language specific
    const headingKravTexts = {
      [Language.NN]: /Godkjenne deling med banken/i,
      [Language.NB]: /Godkjenne deling med banken/i,
      [Language.EN]: /Consent to sharing with the bank/i,
    };
    this.headingKrav = page.getByRole('heading', {
      name: headingKravTexts[language] || headingKravTexts[Language.NB],
    });

    const headingFullmaktTexts = {
      [Language.NN]: /Fullmakt til å handle på dine vegne/i,
      [Language.NB]: /Fullmakt til å handle på dine vegne/i,
      [Language.EN]: /Power of attorney to act on your behalf/i,
    };
    this.headingFullmakt = page.getByRole('heading', {
      name: headingFullmaktTexts[language],
    });

    // Standard intro text - language specific
    const standardLeadTexts = {
      [Language.NN]: /ønskjer å hente opplysningar om deg/i,
      [Language.NB]: /ønsker å hente opplysninger om deg/i,
      [Language.EN]: /requests information about you/i,
    };

    this.textStandardLead = page.getByText(standardLeadTexts[language]);
    // Standard detail text - language specific
    const standardDetailTexts = {
      [Language.NN]: /Ved at du samtykker, får[\s\S]*tilgang til følgjande opplysningar/i,
      [Language.NB]: /Ved at du samtykker, får[\s\S]*tilgang til følgende opplysninger/i,
      [Language.EN]:
        /By giving consent, [\s\S]*gets access to the following information about you/i,
    };
    this.textStandardDetail = page.getByText(standardDetailTexts[language]);

    // Krav intro text - language specific
    const kravLeadTexts = {
      [Language.NN]: /Skatteetaten har utvikla ei løysing/i,
      [Language.NB]: /Skatteetaten har utviklet en løsning/i,
      [Language.EN]: /The Tax Administration has developed a solution/i,
    };
    this.textKravLead = page.getByText(kravLeadTexts[language]);

    const userAccessTexts = {
      [Language.NN]: /Brukarstyrt tilgang/i,
      [Language.NB]: /Brukerstyrt tilgang/i,
      [Language.EN]: /User-managed access/i,
    };
    this.textUserAccess = page.getByText(userAccessTexts[language]);

    // Fullmakt intro text - language specific
    const fullmaktIntroTexts = {
      [Language.NN]:
        /Ved at du gir fullmakt, får[\s\S]*tilgang til følgjande tenester på dine vegne/i,
      [Language.NB]: /Ved at du gir fullmakt, får[\s\S]*tilgang til følgende tjenester/i,
      [Language.EN]:
        /By granting power of attorney, [\s\S]*gets access to the following services on your behalf/i,
    };
    this.textFullmaktIntro = page.getByText(fullmaktIntroTexts[language]);

    // Enkelt samtykke - language specific
    const enkeltLeadTexts = {
      [Language.NN]: /ber om ditt samtykke/i,
      [Language.NB]: /ber om ditt samtykke/i,
      [Language.EN]: /requests your consent/i,
    };
    this.textEnkeltLead = page.getByText(enkeltLeadTexts[language]);

    const enkeltBulletIntroTexts = {
      [Language.NN]: /Ved å godkjenne denne førespurnaden samtykker du til følgjande:/i,
      [Language.NB]: /Ved å godkjenne denne forespørselen samtykker du til følgende:/i,
      [Language.EN]: /By accepting this request you consent to the following:/i,
    };
    this.textEnkeltBulletIntro = page.getByText(enkeltBulletIntroTexts[language]);

    const enkeltLabelTexts = {
      [Language.NN]: /Enkelt samtykke/i,
      [Language.NB]: /Enkelt samtykke/i,
      [Language.EN]: /Simple consent/i,
    };
    this.textEnkeltLabel = page.getByText(enkeltLabelTexts[language]);

    const incomeDataTexts = {
      [Language.NN]:
        /Du samtykkjer til at vi kan hente og bruke inntektsopplysningane dine frå Skatteetaten/i,
      [Language.NB]:
        /Du samtykker til at vi kan hente og bruke dine inntektsopplysninger fra Skatteetaten/i,
      [Language.EN]:
        /You consent to us retrieving and using your income data from the Tax Administration/i,
    };
    this.textIncomeData = page.getByText(incomeDataTexts[language]);

    // Fullmakt service text - language specific
    const fullmaktServiceTexts = {
      [Language.NN]: /Du gjev fullmakt til at ein annan kan utføre tenesta for deg/i,
      [Language.NB]: /Du gir fullmakt til at en annen kan utføre denne tjenesten for deg/i,
      [Language.EN]: /You authorize someone else to perform this service on your behalf/i,
    };
    this.textFullmaktService = page.getByText(fullmaktServiceTexts[language]);

    // Fullmakt expiry text - language specific
    const fullmaktExpiryTexts = {
      [Language.NN]: /Fullmakta er tidsavgrensa og opphøyrer/i,
      [Language.NB]: /Fullmakten er tidsavgrenset og opphører/i,
      [Language.EN]: /The power of attorney is time-limited, and will expire/i,
    };
    this.textFullmaktExpiry = page.getByText(fullmaktExpiryTexts[language]);

    // Fullmakt heading text - language specific
    const fullmaktHeadingTexts = {
      [Language.NN]: /Samtykke fullmakt utføre tjeneste/i,
      [Language.NB]: /Samtykke fullmakt utføre tjeneste/i,
      [Language.EN]: /Consent perform service/i,
    };
    this.textFullmaktHeading = page.getByText(fullmaktHeadingTexts[language]);

    // Loan application text - language specific
    const loanApplicationTexts = {
      [Language.NN]: /Du samtykkjer til at søknadsdata kan brukast i låneprosessen/i,
      [Language.NB]: /Du samtykker til at søknadsdata kan brukes i forbindelse med låneprosessen/i,
      [Language.EN]: /You consent to your application data being used in the loan process/i,
    };
    this.textLoanApplication = page.getByText(loanApplicationTexts[language]);

    // One-time delivery text - language specific
    const oneTimeDeliveryTexts = {
      [Language.NN]: /Samtykket gjeld ein gongs utlevering av opplysningane/i,
      [Language.NB]: /Samtykket gjelder én gangs utlevering av opplysningene/i,
      [Language.EN]: /The consent applies for one-time disclosure of information/i,
    };
    this.textOneTimeDelivery = page.getByText(oneTimeDeliveryTexts[language]);

    // Loan metadata text - these will be set by methods
    this.textInterestRate = page.locator('text=/Rente:/');
    this.textExpirationYear = page.locator('text=/utloepsar:/');
    this.textBankName = page.locator('text=/Bank:/');

    // Simple consent text - language specific
    const dataUsageTexts = {
      [Language.NN]: /Du samtykkjer til at dataa dine kan brukast i denne tenesta/i,
      [Language.NB]: /Du samtykker til at dine data kan brukes i denne tjenesten/i,
      [Language.EN]: /You consent to your data being used in this service/i,
    };
    this.textDataUsage = page.getByText(dataUsageTexts[language]);

    const dataProtectionTexts = {
      [Language.NN]: /vi tek vare på dine data/i,
      [Language.NB]: /vi tar vare på dine data/i,
      [Language.EN]: /we protect your data/i,
    };
    this.textDataProtection = page.getByText(dataProtectionTexts[language]);

    const oneTimeUseTexts = {
      [Language.NN]: /Samtykket gjeld ein gongs bruk/i,
      [Language.NB]: /Samtykket gjelder én gangs bruk/i,
      [Language.EN]: /The consent applies for one-time usage/i,
    };
    this.textOneTimeUse = page.getByText(oneTimeUseTexts[language]);

    // Income year text - will be set by method
    this.textIncomeYear = page.locator('text=/inntektsaar:/');

    // Consent request heading - language specific
    const consentRequestHeadingTexts = {
      [Language.NN]: /Førespurnad om samtykke/i,
      [Language.NB]: /Forespørsel om samtykke/i,
      [Language.EN]: /Request for consent/i,
    };
    this.textConsentRequestHeading = page.getByRole('heading', {
      name: consentRequestHeadingTexts[language],
    });
  }

  // Dynamic helpers
  heading(name: string | RegExp): Locator {
    return this.page.getByRole('heading', { name, exact: false });
  }

  textContains(re: RegExp): Locator {
    return this.page.getByText(re);
  }

  // Navigation
  async open(consentViewUri: string): Promise<void> {
    const url = new URL(consentViewUri);
    url.searchParams.set('DONTCHOOSEREPORTEE', 'TRUE'); // API workaround flag
    await this.page.goto(url.toString(), { waitUntil: 'domcontentloaded' });
  }

  // Expectations (use only POM locators)
  async expectStandardIntro(): Promise<void> {
    await expect(this.standardHeading).toBeVisible();
    await expect(this.textStandardLead).toBeVisible();
    // await expect(this.labelPlaywrightTest).toBeVisible();
    await expect(this.textStandardDetail).toBeVisible();
  }

  async expectKravIntro(): Promise<void> {
    await expect(this.headingKrav).toBeVisible();
    // await expect(this.labelPlaywrightTest).toBeVisible();
    await expect(this.textKravLead).toBeVisible();
    await expect(this.textUserAccess).toBeVisible();
    await expect(this.linkAltinn).toBeVisible();
  }

  async expectFullmaktIntro(): Promise<void> {
    await expect(this.headingFullmakt).toBeVisible();
    // await expect(this.labelPlaywrightTest).toBeVisible();
    await expect(this.textFullmaktIntro).toBeVisible();
  }

  async expectEnkeltIntro(): Promise<void> {
    await expect(this.textEnkeltLead).toBeVisible();
    // await expect(this.labelPlaywrightTest).toBeVisible();
    await expect(this.textEnkeltBulletIntro).toBeVisible();
    await expect(this.textEnkeltLabel).toBeVisible();
  }

  async expectExpiry(formattedOslo: string): Promise<void> {
    const expiryTexts = {
      [Language.NN]: `Samtykket er tidsavgrensa og opphøyrer ${formattedOslo}`,
      [Language.NB]: `Samtykket er tidsavgrenset og opphører ${formattedOslo}`,
      [Language.EN]: `The consent is time-limited, and will expire ${formattedOslo}`,
    };

    const expectedText = expiryTexts[this.language] || expiryTexts[Language.NB];
    const re = new RegExp(expectedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    await expect(this.textContains(re)).toBeVisible();
  }

  async expectFullmaktExpiry(): Promise<void> {
    await expect(this.textFullmaktExpiry).toBeVisible();
  }

  async expectExpiryDate(formattedOslo: string): Promise<void> {
    const re = new RegExp(formattedOslo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    await expect(this.textContains(re)).toBeVisible();
  }

  // Loan metadata methods
  getInterestRateText(rate: string): Locator {
    const interestTexts = {
      [Language.NN]: `Rente: ${rate}`,
      [Language.NB]: `Rente: ${rate}`,
      [Language.EN]: `Interest: ${rate}`,
    };
    const expectedText = interestTexts[this.language];
    return this.page.getByText(expectedText);
  }

  getExpirationYearText(year: string): Locator {
    const yearTexts = {
      [Language.NN]: `utloepsar: ${year}`,
      [Language.NB]: `utloepsar: ${year}`,
      [Language.EN]: `Expiration year: ${year}`,
    };
    const expectedText = yearTexts[this.language] || yearTexts[Language.NB];
    return this.page.getByText(expectedText);
  }

  getBankNameText(bankName: string): Locator {
    const bankTexts = {
      [Language.NN]: `Bank: ${bankName}`,
      [Language.NB]: `Bank: ${bankName}`,
      [Language.EN]: `Bank: ${bankName}`,
    };
    const expectedText = bankTexts[this.language] || bankTexts[Language.NB];
    return this.page.getByText(expectedText);
  }

  getMetadataText(metadata: string): Locator {
    const metadataTexts = {
      [Language.NN]: `metadata: ${metadata}`,
      [Language.NB]: `metadata: ${metadata}`,
      [Language.EN]: `metadata: ${metadata}`,
    };
    const expectedText = metadataTexts[this.language] || metadataTexts[Language.NB];
    return this.page.getByText(expectedText);
  }

  getIncomeYearText(year: string): Locator {
    const incomeYearTexts = {
      [Language.NN]: `inntektsaar: ${year}`,
      [Language.NB]: `inntektsaar: ${year}`,
      [Language.EN]: `year of income: ${year}`,
    };
    const expectedText = incomeYearTexts[this.language] || incomeYearTexts[Language.NB];
    return this.page.getByText(expectedText);
  }

  // actions
  async approveStandardAndWaitLogout(redirectUrl: string): Promise<void> {
    await expect(this.buttonApprove).toBeVisible();
    await expect(this.buttonApprove).toBeEnabled();
    // await this.buttonApprove.click();
    // await this.waitForLogout(redirectUrl);
  }

  async approveFullmaktAndWaitLogout(redirectUrl: string): Promise<void> {
    await expect(this.buttonFullmaktApprove).toBeVisible();
    await expect(this.buttonFullmaktApprove).toBeEnabled();
    await this.buttonFullmaktApprove.click();
    await this.waitForLogout(redirectUrl);
  }

  async rejectStandardAndWaitLogout(redirectUrl: string): Promise<void> {
    await expect(this.buttonReject).toBeVisible();
    await expect(this.buttonReject).toBeEnabled();
    await this.buttonReject.click();
    await this.waitForLogout(redirectUrl);
  }

  async pickLanguage(lang: Language): Promise<void> {
    await this.languagePicker.click();

    switch (lang) {
      case Language.NB:
        await this.norwegian.click();
        break;
      case Language.NN:
        await this.nynorsk.click();
        break;
      case Language.EN:
        await this.english.click();
        break;
      default:
        await this.norwegian.click();
        break;
    }
  }

  async waitForLogout(redirectUrl: string, timeout = 30000): Promise<void> {
    // Ensure the logout redirect happens
    await this.page.waitForURL(/login\.test\.idporten\.no\/logout\/success/i, { timeout });

    // Ensure we land on the final page
    await this.page.waitForURL(redirectUrl, { timeout });
  }
}
