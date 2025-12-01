import { env } from 'playwright/util/helper';
import { LoginPage } from 'playwright/pages/LoginPage';
import { test } from './../fixture/pomFixture';

test.describe('@slow Basic test for Aktorvalg header', () => {
  test('Check that all buttons are visible and clickable', async ({ page, aktorvalgHeader }) => {
    const login = new LoginPage(page);
    await page.goto(env('BASE_URL'));
    await login.LoginToAccessManagement('11886599619');

    // sjekk lenker
    await aktorvalgHeader.GoToInfoportal();
    await aktorvalgHeader.ClickSearchButton();

    // sjekk at alle menyknappene er synlige
    await aktorvalgHeader.CheckAllMenuButtons();

    // velg aktør
    await aktorvalgHeader.GoToSelectActor('Håndfast Plasma');
    await aktorvalgHeader.SelectActor('Kunnskapsrik Kry Ape');

    //sett favoritt
    await aktorvalgHeader.GoToSelectActor('Kunnskapsrik Kry Ape');
    await aktorvalgHeader.ClickFavorite('KKunnskapsrik Kry Ape↳ Org.nr');

    //fjern favoritt
    await aktorvalgHeader.SelectActor('Håndfast Plasma');
    await aktorvalgHeader.GoToSelectActor('Håndfast Plasma');
    await aktorvalgHeader.unfavoriteFirstActor();
  });
});
