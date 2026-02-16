import type { Page } from '@playwright/test';
import { env } from 'playwright/util/helper';
import { LoginPage } from 'playwright/pages/LoginPage';
import type { AktorvalgHeader } from 'playwright/pages/AktorvalgHeader';
import { test } from 'playwright/fixture/pomFixture';

test.describe('Aktørvalg, valg og visning av avgiver', () => {
  const ENV = env('environment')?.toUpperCase();
  const HEADER_TEST_USER = '11886599619';
  const SHOW_DELETED_TEST_USER = '19846999968';
  const DEFAULT_ACTOR_NAME = 'Kunnskapsrik Kry Ape';

  const loginAsHeaderTestUser = async (page: Page, aktorvalgHeader: AktorvalgHeader) => {
    const login = new LoginPage(page);
    await page.goto(env('BASE_URL'));
    await login.LoginToAccessManagement(HEADER_TEST_USER);
    await aktorvalgHeader.selectActorFromHeaderMenu(DEFAULT_ACTOR_NAME);
    await aktorvalgHeader.chooseBokmalLanguage();
  };

  test('Sjekk at slettede enheter kan vises/skjules', async ({ page, aktorvalgHeader }) => {
    test.skip(ENV == 'TT02', 'The "Show Deleted" button is currently feature toggled off in TT02');
    const login = new LoginPage(page);
    await test.step('Log in', async () => {
      await page.goto(env('BASE_URL'));
      await login.LoginToAccessManagement(SHOW_DELETED_TEST_USER);
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

  test('Check that all header buttons are visible and clickable', async ({
    page,
    aktorvalgHeader,
  }) => {
    await test.step('Log in', async () => {
      await loginAsHeaderTestUser(page, aktorvalgHeader);
    });

    await test.step('Click Search button', async () => {
      await aktorvalgHeader.clickSearchButton();
    });

    await test.step('Check visibility for all menu buttons', async () => {
      await aktorvalgHeader.checkAllMenuButtons();
    });
  });

  test('Add and remove favorite actor from actor menu', async ({ page, aktorvalgHeader }) => {
    await test.step('Log in', async () => {
      await loginAsHeaderTestUser(page, aktorvalgHeader);
    });

    await test.step('Reset favorites and select default actor', async () => {
      await aktorvalgHeader.goToSelectActor(DEFAULT_ACTOR_NAME);
      await aktorvalgHeader.removeAllFavorites();
      await aktorvalgHeader.selectActorFromHeaderMenu(DEFAULT_ACTOR_NAME);
    });

    await test.step('Add actor as favorite', async () => {
      await aktorvalgHeader.goToSelectActor(DEFAULT_ACTOR_NAME);
      await aktorvalgHeader.clickFavorite();
    });

    await test.step('Remove actor from favorites', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu('Håndfast Plasma');
      await aktorvalgHeader.goToSelectActor('Håndfast Plasma');
      await aktorvalgHeader.unfavoriteFirstActor();
    });
  });

  test('Search actors by name, birth year, org name and org number', async ({
    page,
    aktorvalgHeader,
  }) => {
    await test.step('Log in and select default actor', async () => {
      await loginAsHeaderTestUser(page, aktorvalgHeader);
      await aktorvalgHeader.selectActorFromHeaderMenu(DEFAULT_ACTOR_NAME);
    });

    await test.step('Search for actor using several fields', async () => {
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
