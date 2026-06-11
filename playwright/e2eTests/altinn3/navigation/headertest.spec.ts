import { test } from 'playwright/fixture/pomFixture';
import { EnduserConnection } from '../../../api-requests/EnduserConnection';

test.describe('Aktørvalg, valg og visning av avgiver', () => {
  const HEADER_TEST_USER = '11886599619';
  const SHOW_DELETED_TEST_USER = '19846999968';
  const DEFAULT_ACTOR_NAME = 'Kunnskapsrik Kry Ape';

  const ACTOR_SEARCH_TEST_USER = '05826397782'; // Need a user with a decent number of actors to properly test the search functionality
  const ACTOR_SEARCH_DEFAULT_ACTOR_NAME = 'Usikker Ringdue';

  const api = new EnduserConnection();

  test('Sjekk at slettede enheter kan vises/skjules', async ({ login, aktorvalgHeader }) => {
    await test.step('Log in', async () => {
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
    login,
    aktorvalgHeader,
  }) => {
    await test.step('Log in', async () => {
      await login.LoginToAccessManagement(HEADER_TEST_USER);
      await aktorvalgHeader.selectActorFromHeaderMenu(DEFAULT_ACTOR_NAME);
      await aktorvalgHeader.chooseBokmalLanguage();
    });

    await test.step('Check visibility for all menu buttons', async () => {
      await aktorvalgHeader.checkAllMenuButtons();
    });
  });

  test('Add and remove favorite actor from actor menu', async ({ login, aktorvalgHeader }) => {
    await test.step('Log in', async () => {
      await login.LoginToAccessManagement(HEADER_TEST_USER);
      await aktorvalgHeader.selectActorFromHeaderMenu(DEFAULT_ACTOR_NAME);
      await aktorvalgHeader.chooseBokmalLanguage();
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
    login,
    aktorvalgHeader,
  }) => {
    await test.step('Log in and select default actor', async () => {
      await login.LoginToAccessManagement(ACTOR_SEARCH_TEST_USER);
      await aktorvalgHeader.selectActorFromHeaderMenu(ACTOR_SEARCH_DEFAULT_ACTOR_NAME);
      await aktorvalgHeader.chooseBokmalLanguage();
      await aktorvalgHeader.selectActorFromHeaderMenu(ACTOR_SEARCH_DEFAULT_ACTOR_NAME);
    });

    await test.step('Search for actor using several fields', async () => {
      await aktorvalgHeader.typeInSearchField('Usikk');
      await aktorvalgHeader.actorIsListed('Usikker Ringdue');

      await aktorvalgHeader.typeInSearchField('1963');
      await aktorvalgHeader.actorIsListed('Usikker Ringdue');

      await aktorvalgHeader.typeInSearchField('Hensynsfull');
      await aktorvalgHeader.actorIsListed('Hensynsfull Rik Tiger');

      await aktorvalgHeader.typeInSearchField('310111872');
      await aktorvalgHeader.actorIsListed('Hensynsfull Rik Tiger');
    });
  });

  test('Virksomhet A skal ikke kunne velge hovedenhet B når underenhet B har delegert en tilgangspakke', async ({
    login,
    aktorvalgHeader,
  }) => {
    await test.step('sett opp testdata', async () => {
      await api.addConnectionAndPackagesToUser('10845998952', '311908421', '311151932', [
        'urn:altinn:accesspackage:byggesoknad',
      ]);
    });

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement('08868199785');
    });

    await test.step('Hovedenhet UVITENDE TOM TIGER AS skal ikke være klikkbar', async () => {
      await aktorvalgHeader.orgIsNotClickableInAktorvalg('UVITENDE TOM TIGER AS');
    });

    await test.step('Se at underenheten for UVITENDE TOM TIGER AS er klikkbare i aktørlista', async () => {
      await aktorvalgHeader.subOrgExistsInAktorvalg('UVITENDE TOM TIGER AS');
    });
  });

  test('Virksomhet A skal ikke kunne velge hovedenhet B når underenhet B har delegert en enkelttjeneste', async ({
    login,
    aktorvalgHeader,
  }) => {
    await test.step('sett opp testdata', async () => {
      await api.addConnection('10845998952', '311908421', '311151932');
      await api.delegateSingleService(
        '10845998952',
        '311908421',
        '311151932',
        'bruno-correspondence',
      );
    });

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement('08868199785');
    });

    await test.step('Hovedenhet UVITENDE TOM TIGER AS skal ikke være klikkbar', async () => {
      await aktorvalgHeader.orgIsNotClickableInAktorvalg('UVITENDE TOM TIGER AS');
    });

    await test.step('Se at underenheten for UVITENDE TOM TIGER AS er klikkbare i aktørlista', async () => {
      await aktorvalgHeader.subOrgExistsInAktorvalg('UVITENDE TOM TIGER AS');
    });
  });
});
