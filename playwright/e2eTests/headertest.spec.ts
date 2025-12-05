import { env } from 'playwright/util/helper';
import { LoginPage } from 'playwright/pages/LoginPage';
import { test } from './../fixture/pomFixture';

test.describe('@slow Basic test for Aktorvalg header', () => {
  test('Check that all buttons are visible and clickable', async ({ page, aktorvalgHeader }) => {
    const login = new LoginPage(page);
    await test.step('Log in', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('11886599619');
    });

    // sjekk lenker
    await test.step('Check link to Infoportal', async () => {
      await aktorvalgHeader.GoToInfoportal();
    });

    await test.step('Click Search button', async () => {
      await aktorvalgHeader.ClickSearchButton();
    });

    // sjekk at alle menyknappene er synlige
    await test.step('Check visibility for all menu buttons', async () => {
      await aktorvalgHeader.CheckAllMenuButtons();
    });

    // velg aktør
    await test.step('Choose an org as actor', async () => {
      await aktorvalgHeader.GoToSelectActor('Håndfast Plasma');
      await aktorvalgHeader.SelectActor('Kunnskapsrik Kry Ape');
    });

    //sett favoritt
    await test.step('Add actor as favorites', async () => {
      await aktorvalgHeader.GoToSelectActor('Kunnskapsrik Kry Ape');
      await aktorvalgHeader.ClickFavorite('KKunnskapsrik Kry Ape↳ Org.nr');
    });

    //fjern favoritt
    await test.step('Remove actor from favorites', async () => {
      await aktorvalgHeader.SelectActor('Håndfast Plasma');
      await aktorvalgHeader.GoToSelectActor('Håndfast Plasma');
      await aktorvalgHeader.unfavoriteFirstActor();
    });
  });
});
