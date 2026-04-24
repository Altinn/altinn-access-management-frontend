import { expect, type Locator, type Page } from '@playwright/test';

export class KlientAdministrasjonPage {
  readonly page: Page;
  readonly leggTilBrukerKnapp: Locator;
  readonly brukerFane: Locator;
  readonly klientFane: Locator;
  readonly brukerSok: Locator;
  readonly fnrFelt: Locator;
  readonly etternavnFelt: Locator;
  readonly leggTilPersonKnapp: Locator;

  constructor(page: Page) {
    this.page = page;
    this.leggTilBrukerKnapp = this.page.getByRole('button', {
      name: 'Legg til ny bruker',
    });
    this.brukerFane = this.page.getByRole('tab', { name: 'Brukere' });
    this.klientFane = this.page.getByRole('tab', { name: 'Klienter' });
    this.brukerSok = this.page.getByRole('searchbox', { name: 'Søk' });
    this.fnrFelt = this.page.getByRole('textbox', { name: 'Fødselsnr./brukernavn' });
    this.etternavnFelt = this.page.getByRole('textbox', { name: 'Etternavn' });
    this.leggTilPersonKnapp = this.page.getByRole('button', { name: 'Legg til person' });
  }

  async goToBrukerFane() {
    await this.brukerFane.click();
  }

  async goToKlientFane() {
    await this.klientFane.click();
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

  async sletteKnappFinnes() {
    await expect(this.page.getByRole('button', { name: 'Slett bruker' })).toBeVisible();
  }

  async slettBruker() {
    await this.page.getByRole('button', { name: 'Slett bruker' }).click();
    await this.page.getByRole('dialog').getByRole('button', { name: 'Slett bruker' }).click();
  }

  async brukerFinnes(brukernavn: string) {
    await expect(this.page.getByRole('heading', { name: brukernavn })).toBeVisible();
  }

  async klikkListeElement(brukernavn: string) {
    await this.page.getByRole('link', { name: brukernavn }).click();
  }

  async ingenBrukereFinnes() {
    await expect(this.page.getByText('Ingen brukere har fått')).toBeVisible();
  }

  async ingenKlienterFinnes() {
    await expect(this.page.getByText('Ingen klienter er tildelt.')).toBeVisible();
  }

  async klikkAlleBrukere() {
    await this.page.getByRole('tab', { name: 'Alle brukere' }).click();
  }

  async klikkAlleKlienter() {
    await this.page.getByRole('tab', { name: 'Alle klienter' }).click();
  }

  async klikkKnapp(navn: string) {
    await this.page.getByRole('button', { name: navn }).click();
  }

  async klikkBruker(navn: string) {
    await this.page.getByRole('link', { name: navn }).click();
  }

  async klikkGiFullmakt(navn: string) {
    await this.page
      .getByText(`${navn}Gi fullmakt`)
      .getByRole('button', { name: 'Gi fullmakt' })
      .click();
  }

  async slettFullmaktKnappFinnes(navn: string) {
    await expect(
      this.page.getByText(`${navn}Slett fullmakt`).getByRole('button', { name: 'Slett fullmakt' }),
    ).toBeVisible();
  }

  async slettFullmakt(navn: string) {
    await this.page
      .getByText(`${navn}Slett fullmakt`)
      .getByRole('button', { name: 'Slett fullmakt' })
      .click();
  }

  async klikkBrukereMedFullmakt() {
    await this.page.getByRole('tab', { name: 'Brukere med fullmakt' }).click();
  }

  async klikkHarDisseKlientene() {
    await this.page.getByRole('tab', { name: 'Har disse klientene' }).click();
  }
}
