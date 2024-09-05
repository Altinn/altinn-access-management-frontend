/* eslint-disable import/no-unresolved */
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class delegateToUser {
  constructor(public page: Page) {}

  async delegateToSSN(ssnUser: string, ssnUserName: string) {
    await this.page.getByRole('link', { name: 'Andre med rettigheter til' }).click();
    await this.page.getByRole('button', { name: 'Legge til ny person eller' }).click();
    await this.page.getByRole('button', { name: 'person' });
    await this.page.getByPlaceholder('siffer').click();
    await this.page.getByPlaceholder('siffer').fill(ssnUser);
    await this.page.getByLabel('Etternavn').click();
    await this.page.getByLabel('Etternavn').fill(ssnUserName);
    await this.page.getByRole('button', { name: 'Neste' }).click();
  }
  async delegateToOrg(orgNumber: string, orgNavn: string) {
    await this.page.getByText('Andre med rettigheter til').click();
    await this.page.getByRole('button', { name: 'Legge til ny person eller' }).click();
    await this.page.getByRole('tab', { name: 'Ekstern virksomhet' }).click();
    await this.page.getByRole('tab', { name: 'Ekstern virksomhet' }).click();
    await this.page.getByRole('textbox', { name: 'Org.nr.' }).fill(orgNumber);
    await this.page.getByPlaceholder('Min. 4 første tegn').fill(orgNavn);
    await this.page.getByRole('textbox', { name: 'Org.nr.' }).click();
    await this.page.getByRole('button', { name: 'Neste' }).click();
  }
}

export class delegateRightsToUser {
  constructor(public page: Page) {}

  async delegateRightsToSSN(resourceName: string) {
    await this.page.getByRole('link', { name: 'Gi tilgang til enkelttjenester' }).click();
    await this.page.getByLabel('Søk etter skjema og tjeneste').click();
    await this.page.getByLabel('Søk etter skjema og tjeneste').fill(resourceName);
    await this.page.keyboard.press('Enter');
    await new Promise((resolve) =>
      setTimeout(() => {
        resolve(null);
      }, 500),
    );
    await this.page.getByRole('button', { name: resourceName }).first().click();
    await this.page.getByRole('button', { name: 'Legg til add' }).first().click();
    await this.page.getByRole('button', { name: 'Valgte tjenester' }).click();
    await this.page.getByLabel('Valgte tjenester').getByText(resourceName);
    await this.page
      .locator('button')
      .filter({ hasText: /^Gå videre$/ })
      .click();
    await this.page.getByRole('button', { name: 'Fullfør delegering' }).click();
    await this.page.getByRole('button', { name: 'Bekreft' }).click();
    await this.page.getByRole('button', { name: 'Ferdig' }).click();
    await this.page.getByRole('link', { name: 'Har tilgang til disse' }).click();

    const refreshLimit = 8;
    let numRefreshes = 0;
    let elementNotVisible = true;

    // Loop until the resourceName is visible or until we reach the refresh limit
    while (elementNotVisible && numRefreshes < refreshLimit) {
      const resourceText = await this.page.locator('css=#DirectRights-View-Actor').innerText();
      if (resourceText.includes(resourceName)) {
        elementNotVisible = false;
        await this.page.getByRole('link', { name: 'Har tilgang til disse' }).click();
        await expect(this.page.locator('css=#DirectRights-View-Actor')).toContainText(resourceName);
      } else {
        await this.page.reload();
        numRefreshes++;
        await this.page.waitForTimeout(1000); // wait for 1 second before the next check
      }
    }
  }
}
export class coverebyUserRights {
  constructor(public page: Page) {}

  async checkCoverebyRights() {
    await this.page.getByRole('link', { name: 'Skjema og tjenester du har' }).click();
    await this.page.getByRole('link', { name: 'Har tilgang til disse' }).click();
    const coveredByRights = await this.page.innerText('css=#DirectRights-View');
  }
  async checkCoverebyOrgRights() {
    await this.page.getByRole('link', { name: 'Skjema og tjenester du har' }).click();
    await this.page.getByRole('link', { name: 'Har tilgang til disse' }).click();
  }
}
export class delegateRoleToUser {
  constructor(public page: Page) {}

  async delegateRole(roleName1: string, roleName2: string) {
    await this.page.getByText('Har også disse').click();
    await this.page.getByText('+ Legg til ny rolle').click();
    await this.page.locator('span.col', { hasText: roleName1 }).click();
    await this.page.locator('span.col', { hasText: roleName2 }).click();
    await this.page.getByRole('button', { name: 'Jeg forstår. Fullfør' }).click();
    await this.page.getByPlaceholder('f.eks post@karinordmann.no').click();
    await this.page.getByPlaceholder('f.eks post@karinordmann.no').fill('test@email.com');
    await this.page.getByRole('button', { name: 'Fullfør' }).first().click();
    await this.page.getByRole('link', { name: 'Ferdig' }).click();
  }
}
export class revokeRights {
  constructor(public page: Page) {}

  async revokeRightsSSN(reporteeName: string) {
    const rightsHoldersList = this.page.locator('css=#rightHolderList');
    const loader = rightsHoldersList.locator('css=.a-loader');

    await this.page.getByRole('link', { name: 'Andre med rettigheter til' }).click();
    await loader.waitFor({ state: 'attached' });

    await loader.waitFor({ state: 'detached' });

    if (await this.page.getByRole('link', { name: reporteeName }).isVisible()) {
      await this.page.getByRole('link', { name: reporteeName }).click();
      const removeButton = this.page
        .getByRole('button')
        .filter({ hasText: 'Fjern en eller flere' });
      if (await removeButton.isDisabled()) {
        console.error('Button not found');
        await this.page.getByLabel('Lukk').click();
        await this.page.getByRole('link', { name: 'Andre med rettigheter til' }).click();
      } else {
        await removeButton.click();
        await this.page.getByText('Fjern alle').first().click();
        await this.page.getByRole('button').filter({ hasText: 'Ferdig' }).click();
        await this.page.getByRole('link', { name: 'Ferdig' }).click();
        await this.page.goto(process.env.BASE_URL + '/ui/profile');
      }
    } else {
      console.error('Reportee not found');
      await this.page.goto(process.env.BASE_URL + '/ui/profile');
    }
  }

  async revokeRightsOrg(reporteeName: string, buttonIndex: number) {
    const rightsHoldersList = this.page.locator('css=#rightHolderList');
    const loader = rightsHoldersList.locator('css=.a-loader');
    const reporteLinks = this.page.getByRole('link', { name: reporteeName });
    const reporteeLink = reporteLinks.nth(buttonIndex);

    await this.page.getByRole('link', { name: 'Andre med rettigheter til' }).click();
    await loader.waitFor({ state: 'attached' });

    await loader.waitFor({ state: 'detached' });

    if (await this.page.getByRole('link', { name: reporteeName }).isVisible()) {
      await this.page.getByRole('link', { name: reporteeName }).click();

      if (await reporteeLink.isVisible()) {
        await reporteeLink.click();
        const removeButton = this.page
          .getByRole('button')
          .filter({ hasText: 'Fjern en eller flere' });
        if (await removeButton.isDisabled()) {
          console.error('Button not found');
          await this.page.getByLabel('Lukk').click();
          await this.page.getByRole('link', { name: 'Andre med rettigheter til' }).click();
        } else {
          await removeButton.click();
          await this.page.getByText('Fjern alle').first().click();
          await this.page.getByRole('button').filter({ hasText: 'Ferdig' }).click();
          await this.page.getByRole('link', { name: 'Ferdig' }).click();
          await this.page.goto(process.env.BASE_URL + '/ui/profile');
        }
      }
    } else {
      console.error('Reportee not found');
      await this.page.goto(process.env.BASE_URL + '/ui/profile');
    }
  }
}
