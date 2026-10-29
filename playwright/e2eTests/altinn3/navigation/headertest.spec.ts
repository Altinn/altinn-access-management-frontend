import { medTestbrukere } from 'playwright/fixture/pomFixture';
import { loadTestdata } from 'playwright/util/testdata';

// Favoritter trenger bare en bruker med én aktør i tillegg til seg selv.
const test = medTestbrukere({ favorittLeder: 'dagligLeder' });

const TESTDATA = loadTestdata('header');
const {
  personer: [slettedeEnheterBruker],
  organisasjoner: [slettetAktoer],
} = TESTDATA.slettedeEnheter;
const {
  personer: [sokBruker],
  organisasjoner: [sokVirksomhet],
} = TESTDATA.sok;
const {
  personer: [underenhetBruker],
  organisasjoner: [underenhet, mottaker, hovedenhet],
} = TESTDATA.underenhet;

test.describe('Aktørvalg, valg og visning av avgiver', () => {
  const SHOW_DELETED_TEST_USER = slettedeEnheterBruker.pid;

  // Need a user with a decent number of actors to properly test the search functionality.
  // The search terms below must match the `sok` test data.
  const ACTOR_SEARCH_TEST_USER = sokBruker.pid;
  const ACTOR_SEARCH_DEFAULT_ACTOR_NAME = sokBruker.name;

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
      await aktorvalgHeader.expectDeletedActorToBeVisible(slettetAktoer.name);
    });
  });

  test('Check that all header buttons are visible and clickable', async ({
    favorittLeder,
    login,
    aktorvalgHeader,
  }) => {
    await test.step('Log in', async () => {
      await login.LoginToAccessManagement(favorittLeder.pid);
      await aktorvalgHeader.selectActorFromHeaderMenu(favorittLeder.name);
      await aktorvalgHeader.chooseBokmalLanguage();
    });

    await test.step('Check visibility for all menu buttons', async () => {
      await aktorvalgHeader.checkAllMenuButtons();
    });
  });

  test('Add and remove favorite actor from actor menu', async ({
    favorittLeder,
    login,
    aktorvalgHeader,
  }) => {
    await test.step('Log in', async () => {
      await login.LoginToAccessManagement(favorittLeder.pid);
      await aktorvalgHeader.selectActorFromHeaderMenu(favorittLeder.name);
      await aktorvalgHeader.chooseBokmalLanguage();
    });

    await test.step('Reset favorites and select default actor', async () => {
      await aktorvalgHeader.goToSelectActor(favorittLeder.name);
      await aktorvalgHeader.removeAllFavorites();
      await aktorvalgHeader.selectActorFromHeaderMenu(favorittLeder.name);
    });

    await test.step('Add actor as favorite', async () => {
      await aktorvalgHeader.goToSelectActor(favorittLeder.name);
      await aktorvalgHeader.clickFavorite();
    });

    await test.step('Remove actor from favorites', async () => {
      await aktorvalgHeader.selectActorFromHeaderMenu(favorittLeder.managerName);
      await aktorvalgHeader.goToSelectActor(favorittLeder.managerName);
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
      await aktorvalgHeader.goToSelectActor(ACTOR_SEARCH_DEFAULT_ACTOR_NAME);
    });

    await test.step('Search for actor using several fields', async () => {
      await aktorvalgHeader.typeInSearchField('Usikk');
      await aktorvalgHeader.actorIsListed(sokBruker.name);

      await aktorvalgHeader.typeInSearchField('1963');
      await aktorvalgHeader.actorIsListed(sokBruker.name);

      await aktorvalgHeader.typeInSearchField('Hensynsfull');
      await aktorvalgHeader.actorIsListed(sokVirksomhet.name);

      await aktorvalgHeader.typeInSearchField(sokVirksomhet.orgNo);
      await aktorvalgHeader.actorIsListed(sokVirksomhet.name);
    });
  });

  test('Virksomhet A skal ikke kunne velge hovedenhet B når underenhet B har delegert en tilgangspakke', async ({
    login,
    aktorvalgHeader,
    api,
  }) => {
    await test.step('sett opp testdata', async () => {
      await api.connections.addConnectionAndPackagesToUser(
        underenhet.pid,
        underenhet.orgNo,
        mottaker.orgNo,
        ['urn:altinn:accesspackage:byggesoknad'],
      );
    });

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement(underenhetBruker.pid);
    });

    await test.step('Hovedenhet UVITENDE TOM TIGER AS skal ikke være klikkbar', async () => {
      await aktorvalgHeader.orgIsNotClickableInAktorvalg(hovedenhet.name);
    });

    await test.step('Se at underenheten for UVITENDE TOM TIGER AS er klikkbare i aktørlista', async () => {
      await aktorvalgHeader.subOrgExistsInAktorvalg(hovedenhet.name);
    });
  });

  test('Virksomhet A skal ikke kunne velge hovedenhet B når underenhet B har delegert en enkelttjeneste', async ({
    login,
    aktorvalgHeader,
    api,
  }) => {
    await test.step('sett opp testdata', async () => {
      await api.connections.addConnection(underenhet.pid, underenhet.orgNo, mottaker.orgNo);
      await api.connections.delegateSingleService(
        underenhet.pid,
        underenhet.orgNo,
        mottaker.orgNo,
        'bruno-correspondence',
      );
    });

    await test.step('Logg inn', async () => {
      await login.LoginToAccessManagement(underenhetBruker.pid);
    });

    await test.step('Hovedenhet UVITENDE TOM TIGER AS skal ikke være klikkbar', async () => {
      await aktorvalgHeader.orgIsNotClickableInAktorvalg(hovedenhet.name);
    });

    await test.step('Se at underenheten for UVITENDE TOM TIGER AS er klikkbare i aktørlista', async () => {
      await aktorvalgHeader.subOrgExistsInAktorvalg(hovedenhet.name);
    });
  });
});
