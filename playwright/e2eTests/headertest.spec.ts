import { env } from 'playwright/util/helper';
import { LoginPage } from 'playwright/pages/LoginPage';
import { test } from './../fixture/pomFixture';

test.describe('Aktørvalg, valg og visning av avgiver', () => {
  test('Sjekk at slettede enheter kan vises/skjules', async ({ page, aktorvalgHeader }) => {
    const login = new LoginPage(page);
    await test.step('Log in', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('19846999968');
    });

    await test.step('Go to actor selector', async () => {
      await aktorvalgHeader.goToInfoportal();
      await aktorvalgHeader.goToSelectActor('Pratsom Skole');
    });

    await test.step('Expect three actors to be visible', async () => {
      await aktorvalgHeader.uncheckShowDeletedSwitch();
      await aktorvalgHeader.expectedNumberOfActors(3);
    });

    await test.step('Click the "show deleted" switch', async () => {
      await aktorvalgHeader.checkShowDeletedSwitch();
    });

    await test.step('Expect four actors to be visible', async () => {
      await aktorvalgHeader.expectedNumberOfActors(4);
    });

    await test.step('Expect one of them to be a deleted actor', async () => {
      await aktorvalgHeader.expectDeletedActorToBeVisible('Sjelden Ren Katt Konjakk');
    });
  });

  test('Check that all buttons are visible and clickable', async ({ page, aktorvalgHeader }) => {
    const login = new LoginPage(page);
    await test.step('Log in', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement('11886599619');
    });

    // sjekk lenker
    await test.step('Check link to Infoportal', async () => {
      await aktorvalgHeader.goToInfoportal();
    });

    await test.step('choose bokmål', async () => {
      await aktorvalgHeader.chooseBokmalLanguage();
    });

    await test.step('Click Search button', async () => {
      await aktorvalgHeader.clickSearchButton();
    });

    // sjekk at alle menyknappene er synlige
    await test.step('Check visibility for all menu buttons', async () => {
      await aktorvalgHeader.checkAllMenuButtons();
    });

    // velg aktør
    await test.step('Choose an org as actor', async () => {
      await aktorvalgHeader.goToSelectActor('Håndfast Plasma');
      await aktorvalgHeader.removeAllFavorites();
      await aktorvalgHeader.selectActor('Kunnskapsrik Kry Ape');
    });

    //sett favoritt
    await test.step('Add actor as favorites', async () => {
      await aktorvalgHeader.goToSelectActor('Kunnskapsrik Kry Ape');
      await aktorvalgHeader.clickFavorite('KKunnskapsrik Kry Ape↳ Org.nr');
    });

    //fjern favoritt
    await test.step('Remove actor from favorites', async () => {
      await aktorvalgHeader.selectActor('Håndfast Plasma');
      await aktorvalgHeader.goToSelectActor('Håndfast Plasma');
      await aktorvalgHeader.unfavoriteFirstActor();
    });

    // søk
    await test.step('search for name, date of birth, org name, and org number', async () => {
      await aktorvalgHeader.typeInSearchField('hånd');
      await aktorvalgHeader.actorIsListed('Håndfast Plasma');

      await aktorvalgHeader.typeInSearchField('1965');
      await aktorvalgHeader.actorIsListed('Håndfast Plasma');

      await aktorvalgHeader.typeInSearchField('kunnskap');
      await aktorvalgHeader.actorIsListed('Kunnskapsrik Kry Ape');

      await aktorvalgHeader.typeInSearchField('310470422');
      await aktorvalgHeader.actorIsListed('Kunnskapsrik Kry Ape');
    });
  });
});
