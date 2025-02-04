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

    const refreshLimit = 10;
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
  async nonDelegatebleRightsToSSN(resourceName: string) {
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
    await this.page.getByLabel('Du kan ikke gi fullmakt til denne tjenesten').isVisible();
    if (await this.page.getByLabel('Du kan ikke gi fullmakt til denne tjenesten').isVisible()) {
      console.log(`Negativ test vellykket`);
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
    await this.page.goto(process.env.BASE_URL + '/ui/profile');
  }

  async delegateRoles(roleName1: string, roleName2: string, reporteeName: string) {
    await this.page.getByText('Har også disse').click();
    await this.page.getByText('+ Legg til ny rolle').click();
    await this.page.locator('span.col', { hasText: roleName1 }).click();
    await this.page.locator('span.col', { hasText: roleName2 }).click();
    await this.page.getByRole('button', { name: 'Ferdig' }).click();
    await this.page.getByPlaceholder('f.eks post@karinordmann.no').click();
    await this.page.getByPlaceholder('f.eks post@karinordmann.no').fill('test@email.com');
    await this.page.getByRole('button', { name: 'Fullfør' }).first().click();
    await this.page.getByRole('link', { name: 'Ferdig' }).click();
    await this.page.goto(process.env.BASE_URL + '/ui/profile');
    await this.page.getByRole('link', { name: 'Andre med rettigheter til' }).click();
    await this.page.getByRole('link', { name: reporteeName }).click();
    const reporteeButton = this.page.getByRole('link', { name: reporteeName }).nth(1);
    // Check if the button is visible
    if (await reporteeButton.isVisible()) {
      await reporteeButton.click();
    } else {
      console.log(`Button with index ${reporteeName} is not visible.`);
    }
  }
}
export class revokeRights {
  constructor(public page: Page) {}

  async revokeRightsSSN(reporteeName: string) {
    const rightsHoldersList = this.page.locator('css=#rightHolderList');
    const loader = rightsHoldersList.locator('css=.a-loader');

    await this.page.getByRole('link', { name: 'Andre med rettigheter til' }).click();
    await loader.waitFor({ state: 'visible' });

    await loader.waitFor({ state: 'hidden' });

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
        const fjernAlleElements = this.page.locator('span:has-text("Fjern alle")');
        await fjernAlleElements.first().waitFor({ state: 'visible', timeout: 7000 });
        const fjernAlleCount = await fjernAlleElements.count();
        if (fjernAlleCount === 0) {
          console.error('No "Fjern alle" buttons found.');
        } else {
          for (let i = 0; i < fjernAlleCount; i++) {
            const fjernAlleElement = fjernAlleElements.nth(i);
            await fjernAlleElement.scrollIntoViewIfNeeded();
            await fjernAlleElement.click({ force: true });
            console.log(`Clicked "Fjern alle" button ${i + 1}.`);
          }
        }
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
        await reporteeLink.waitFor({ state: 'visible', timeout: 5000 });
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
          const fjernAlleElements = this.page.locator('span:has-text("Fjern alle")');
          await fjernAlleElements.first().waitFor({ state: 'visible', timeout: 5000 });

          const fjernAlleCount = await fjernAlleElements.count();
          if (fjernAlleCount === 0) {
            console.error('No "Fjern alle" buttons found.');
          } else {
            console.log(`Found ${fjernAlleCount} "Fjern alle" buttons. Clicking each...`);
            for (let i = 0; i < fjernAlleCount; i++) {
              const fjernAlleElement = fjernAlleElements.nth(i);
              await fjernAlleElement.scrollIntoViewIfNeeded();
              await fjernAlleElement.click({ force: true });
              console.log(`Clicked "Fjern alle" button ${i + 1}.`);
            }
          }
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

export class instantiateResource {
  constructor(public page: Page) {}

  async instantiateApp(appReportee: string) {
    // Go to the app URL
    await this.page.goto(process.env.APP_URL as string);
    try {
      const headingVisible = await this.page
        .waitForSelector('role=heading[name="Hvem vil du sende inn for?"]', { timeout: 5000 })
        .then(() => true)
        .catch(() => false);

      if (headingVisible) {
        await this.page.getByPlaceholder('Søk etter aktør').click();
        await this.page.getByPlaceholder('Søk etter aktør').fill(appReportee);
        await this.page.getByRole('button', { name: appReportee }).click();

        // If heading is not visible, check the current URL
        const baseUrl = this.page.url().split('?')[0].split('#')[0];
        const expectedBaseUrl = process.env.APP_URL;

        if (baseUrl !== expectedBaseUrl) {
          throw new Error(
            `Navigation failed. Expected base URL: ${expectedBaseUrl}, but got: ${baseUrl}`,
          );
        }

        // Close form if the button is available
        await this.page.getByLabel('Lukk skjema').click();
        await this.page.goto(process.env.BASE_URL + '/ui/profile');
      }
    } catch (error) {
      console.error('An error occurred during navigation:', error);
      throw error; // Re-throw to fail the test if an error is encountered
    }
  }
}
