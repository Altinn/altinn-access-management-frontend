import { medTestbrukere } from 'playwright/fixture/pomFixture';
import { foedselsaar } from 'playwright/util/helper';
import { loadTestdata } from 'playwright/util/testdata';

// Favoritter trenger bare en bruker med én aktør i tillegg til seg selv.
const test = medTestbrukere({
  favorittLeder: 'dagligLeder',
  // Underenheten til B delegerer til A, og daglig leder i A logger inn.
  virksomhetA: 'dagligLeder',
  virksomhetB: 'hovedenhet',
});

const TESTDATA = loadTestdata('header');
const {
  personer: [slettedeEnheterBruker],
  organisasjoner: [slettetAktoer],
} = TESTDATA.slettedeEnheter;
const {
  personer: [sokBruker],
  organisasjoner: [sokVirksomhet],
} = TESTDATA.sok;

test.describe('Aktørvalg, valg og visning av avgiver', () => {
  const SHOW_DELETED_TEST_USER = slettedeEnheterBruker.pid;

  // Need a user with a decent number of actors to properly test the search functionality.
  // The search terms are taken from the `sok` test data: the user and one of their organisations.
  const ACTOR_SEARCH_TEST_USER = sokBruker.pid;
  const ACTOR_SEARCH_DEFAULT_ACTOR_NAME = sokBruker.name;

  test('Sjekk at slettede enheter kan vises/skjules', async ({ login, aktorvalgHeader }) => {
    await test.step('Log in', async () => {
      await login.LoginToAccessManagement(SHOW_DELETED_TEST_USER);
    });

    await test.step('Deleted actor is hidden while "show deleted" is off', async () => {
      await aktorvalgHeader.uncheckShowDeletedSwitch();
      await aktorvalgHeader.expectDeletedActorToBeHidden(slettetAktoer.name);
    });

    await test.step('Click the "show deleted" switch', async () => {
      await aktorvalgHeader.checkShowDeletedSwitch();
    });

    await test.step('Deleted actor is listed and marked as deleted', async () => {
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
      await aktorvalgHeader.typeInSearchField(sokBruker.name.slice(0, 5));
      await aktorvalgHeader.actorIsListed(sokBruker.name);

      await aktorvalgHeader.typeInSearchField(String(foedselsaar(sokBruker.pid)));
      await aktorvalgHeader.actorIsListed(sokBruker.name);

      await aktorvalgHeader.typeInSearchField(sokVirksomhet.name.split(' ')[0]);
      await aktorvalgHeader.actorIsListed(sokVirksomhet.name);

      await aktorvalgHeader.typeInSearchField(sokVirksomhet.orgNo);
      await aktorvalgHeader.actorIsListed(sokVirksomhet.name);
    });
  });

  test.describe('underenhet som delegerer', () => {
    test.afterEach(async ({ virksomhetA, virksomhetB, api }) => {
      try {
        await api.connections.deleteConnection(virksomhetB.pid, virksomhetB.underenhetOrgNo, [
          virksomhetA.orgNo,
        ]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });

    test('Virksomhet A skal ikke kunne velge hovedenhet B når underenhet B har delegert en tilgangspakke', async ({
      virksomhetA,
      virksomhetB,
      login,
      aktorvalgHeader,
      api,
    }) => {
      await test.step('sett opp testdata', async () => {
        await api.connections.addConnectionAndPackagesToUser(
          virksomhetB.pid,
          virksomhetB.underenhetOrgNo,
          virksomhetA.orgNo,
          ['urn:altinn:accesspackage:byggesoknad'],
        );
      });

      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(virksomhetA.pid);
      });

      await test.step(`Hovedenhet ${virksomhetB.name} skal ikke være klikkbar`, async () => {
        await aktorvalgHeader.orgIsNotClickableInAktorvalg(virksomhetB.name);
      });

      await test.step(`Se at underenheten for ${virksomhetB.name} er klikkbar i aktørlista`, async () => {
        await aktorvalgHeader.subOrgExistsInAktorvalg(virksomhetB.name);
      });
    });

    test('Virksomhet A skal ikke kunne velge hovedenhet B når underenhet B har delegert en enkelttjeneste', async ({
      virksomhetA,
      virksomhetB,
      login,
      aktorvalgHeader,
      api,
    }) => {
      await test.step('sett opp testdata', async () => {
        await api.connections.addConnection(
          virksomhetB.pid,
          virksomhetB.underenhetOrgNo,
          virksomhetA.orgNo,
        );
        await api.connections.delegateSingleService(
          virksomhetB.pid,
          virksomhetB.underenhetOrgNo,
          virksomhetA.orgNo,
          'bruno-correspondence',
        );
      });

      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(virksomhetA.pid);
      });

      await test.step(`Hovedenhet ${virksomhetB.name} skal ikke være klikkbar`, async () => {
        await aktorvalgHeader.orgIsNotClickableInAktorvalg(virksomhetB.name);
      });

      await test.step(`Se at underenheten for ${virksomhetB.name} er klikkbar i aktørlista`, async () => {
        await aktorvalgHeader.subOrgExistsInAktorvalg(virksomhetB.name);
      });
    });
  });
});
