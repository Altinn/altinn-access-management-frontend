import { expect, type Locator, type Page } from '@playwright/test';

import { LANGUAGE_DICTIONARIES, Language, type Dict } from '../LanguageMenu';

export class KlientAdministrasjonPage {
  readonly page: Page;
  readonly texts: Dict;
  readonly leggTilBrukerKnapp: Locator;
  readonly brukerFane: Locator;
  readonly klientFane: Locator;
  readonly brukerSok: Locator;
  readonly fnrFelt: Locator;
  readonly etternavnFelt: Locator;
  readonly leggTilPersonKnapp: Locator;
  readonly slettBrukerKnapp: Locator;
  readonly slettBrukerDialogKnapp: Locator;
  readonly ingenBrukereTekst: Locator;
  readonly ingenKlienterTekst: Locator;
  readonly sideOverskrift: Locator;
  readonly harDisseKlienteneFane: Locator;
  readonly alleKlienterFane: Locator;
  readonly brukereMedFullmaktFane: Locator;
  readonly alleBrukereFane: Locator;

  constructor(page: Page, language: Language = Language.NB) {
    this.page = page;
    this.texts = LANGUAGE_DICTIONARIES[language];
    const client = this.texts.client_administration_page;

    this.leggTilBrukerKnapp = this.page.getByRole('button', { name: client.add_agent_button });
    this.brukerFane = this.page.getByRole('tab', { name: client.agents_tab_title });
    this.klientFane = this.page.getByRole('tab', { name: client.clients_tab_title });
    // page_heading is "Klientadministrasjon for {{name}}" — match the static prefix.
    this.sideOverskrift = this.page.getByRole('heading', {
      name: client.page_heading.split('{{name}}')[0].trim(),
    });
    this.harDisseKlienteneFane = this.page.getByRole('tab', { name: client.agent_has_clients_tab });
    this.alleKlienterFane = this.page.getByRole('tab', { name: client.agent_can_get_clients_tab });
    this.brukereMedFullmaktFane = this.page.getByRole('tab', {
      name: client.client_has_agents_tab,
    });
    this.alleBrukereFane = this.page.getByRole('tab', { name: client.client_can_get_agents_tab });
    // "Søk" is a design-system searchbox placeholder, not in our localization files.
    this.brukerSok = this.page.getByRole('searchbox', { name: 'Søk' });
    this.fnrFelt = this.page.getByRole('textbox', {
      name: this.texts.new_user_modal.person_identifier,
    });
    this.etternavnFelt = this.page.getByRole('textbox', { name: this.texts.common.last_name });
    this.leggTilPersonKnapp = this.page.getByRole('button', {
      name: this.texts.new_user_modal.add_person_button,
    });
    this.slettBrukerKnapp = this.page.getByRole('button', { name: client.agent_delete_button });
    this.slettBrukerDialogKnapp = this.page
      .getByRole('dialog')
      .getByRole('button', { name: client.agent_delete_confirm });
    this.ingenBrukereTekst = this.page.getByText(client.no_agents);
    this.ingenKlienterTekst = this.page.getByText(client.no_delegations);
  }

  // Verifiser at klientadministrasjonssiden (oversikten) er lastet før vi klikker oss videre.
  async verifyPaaKlientadministrasjon() {
    await expect(this.sideOverskrift).toBeVisible();
    await expect(this.brukerFane).toBeVisible();
    await expect(this.klientFane).toBeVisible();
  }

  // Verifiser at vi er på brukerdetaljsiden (agent) før vi klikker oss videre.
  async verifyPaaBrukerDetaljer() {
    await expect(this.harDisseKlienteneFane).toBeVisible();
    await expect(this.alleKlienterFane).toBeVisible();
  }

  // Verifiser at vi er på klientdetaljsiden før vi klikker oss videre.
  async verifyPaaKlientDetaljer() {
    await expect(this.brukereMedFullmaktFane).toBeVisible();
    await expect(this.alleBrukereFane).toBeVisible();
  }

  async goToBrukerFane() {
    await this.brukerFane.click();
    await expect(this.brukerFane).toHaveAttribute('aria-selected', 'true');
  }

  async goToKlientFane() {
    await Promise.all([
      this.page.waitForResponse(
        (resp) => resp.url().includes('api/v1/clientdelegations/clients') && resp.ok(),
      ),
      await this.klientFane.click(),
      await expect(this.klientFane).toHaveAttribute('aria-selected', 'true'),
    ]);
  }

  async clickLeggTilBrukerKnapp() {
    await this.leggTilBrukerKnapp.click();
  }

  async searchForUser(userName: string) {
    await this.brukerSok.fill(userName);
  }

  async skrivFnr(fnr: string) {
    await this.fnrFelt.fill(fnr);
  }

  async skrivEtternavn(etternavn: string) {
    await this.etternavnFelt.fill(etternavn);
  }

  async klikkLeggTilPerson() {
    await this.leggTilPersonKnapp.click();
  }

  async slettBruker() {
    await this.slettBrukerKnapp.click();
    await this.slettBrukerDialogKnapp.click();
  }

  brukerKnapp(brukernavn: string): Locator {
    return this.page.getByRole('heading', { name: brukernavn });
  }

  // Klient/brukerraden i en liste rendres som en knapp (med navn og org.nr.).
  // Brukes der raden er en knapp og ikke en heading.
  klientKnapp(navn: string): Locator {
    return this.page.getByRole('button', { name: navn });
  }

  async klikkListeElement(brukernavn: string) {
    await this.page.getByRole('link', { name: brukernavn }).click();
  }

  async klikkAlleBrukere() {
    await this.alleBrukereFane.click();
    await expect(this.alleBrukereFane).toHaveAttribute('aria-selected', 'true');
  }

  async klikkAlleKlienter() {
    await this.alleKlienterFane.click();
    await expect(this.alleKlienterFane).toHaveAttribute('aria-selected', 'true');
  }

  async klikkKnapp(navn: string) {
    await this.page.getByRole('button', { name: navn }).click();
  }

  async klikkBruker(navn: string) {
    await this.page.getByRole('link', { name: navn }).click();
  }

  async klikkGiFullmakt(navn: string) {
    const giFullmakt = this.texts.client_administration_page.delegate_package_button;
    await this.page
      .getByText(`${navn}${giFullmakt}`)
      .getByRole('button', { name: giFullmakt })
      .click();
  }

  slettFullmaktKnapp(navn: string): Locator {
    const slettFullmakt = this.texts.client_administration_page.remove_package_button;
    return this.page
      .getByText(`${navn}${slettFullmakt}`)
      .getByRole('button', { name: slettFullmakt });
  }

  async slettFullmakt(navn: string) {
    await this.slettFullmaktKnapp(navn).click();
  }

  async klikkBrukereMedFullmakt() {
    await this.brukereMedFullmaktFane.click();
    await expect(this.brukereMedFullmaktFane).toHaveAttribute('aria-selected', 'true');
  }

  async klikkHarDisseKlientene() {
    await this.harDisseKlienteneFane.click();
    await expect(this.harDisseKlienteneFane).toHaveAttribute('aria-selected', 'true');
  }
}
