import { test } from '../../../fixture/pomFixture';
import { loadTestdata } from '../../../util/testdata';

const TESTDATA = loadTestdata('enkelttjenestedelegering');

const service = 'bruno-correspondence';

test.describe('Enkelttjenestedelegering fra person til person og person til org', () => {
  test.describe('Deleger enkelttjeneste til person', () => {
    const {
      personer: [delegator, recipient],
    } = TESTDATA.personDelegerTilPerson;

    test.beforeEach(async ({ api }) => {
      await api.connections.addConnection(delegator.pid, delegator.pid, recipient.pid);
    });

    test.afterEach(async ({ api }) => {
      try {
        await api.connections.deleteSingleServiceDelegation(
          delegator.pid,
          delegator.pid,
          recipient.pid,
          service,
        );
      } catch (error) {
        console.error('Cleanup: Failed to delete single service delegation:', error);
      }
      try {
        await api.connections.deleteConnection(delegator.pid, delegator.pid, [recipient.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });

    test('Deleger enkelttjeneste til person', async ({
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(delegator.pid);
      });

      await test.step(`Velg deg selv (${delegator.name}) og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(delegator.name);
      });

      await test.step(`Gå til brukere-siden og klikk på "${recipient.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.name);
      });

      await test.step(`Gi ${recipient.name} fullmakt til enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.sokEtterEnkelttjeneste(service);
        await accessManagementFrontPage.clickEnkelttjeneste(service);
        await accessManagementFrontPage.clickGiFullmaktEnkelttjeneste();
        await accessManagementFrontPage.LukkGiFullmaktVindu();
      });

      await test.step(`${recipient.name} skal ha enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.name);
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.userCanDeleteEnkelttjeneste(service);
      });
    });
  });

  test.describe('Deleger enkelttjeneste til virksomhet', () => {
    const {
      organisasjoner: [recipient],
      personer: [delegator],
    } = TESTDATA.personDelegerTilVirksomhet;

    test.beforeEach(async ({ api }) => {
      await api.connections.addConnection(delegator.pid, delegator.pid, recipient.orgNo);
    });

    test.afterEach(async ({ api }) => {
      try {
        await api.connections.deleteSingleServiceDelegation(
          delegator.pid,
          delegator.pid,
          recipient.orgNo,
          service,
        );
      } catch (error) {
        console.error('Cleanup: Failed to delete single service delegation:', error);
      }
      try {
        await api.connections.deleteConnection(delegator.pid, delegator.pid, [recipient.orgNo]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });

    test('Deleger enkelttjeneste til virksomhet', async ({
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(delegator.pid);
      });

      await test.step(`Velg org ${delegator.name} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(delegator.name);
      });

      await test.step(`Gå til brukere-siden og klikk på "${recipient.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expandOrg(recipient.name);
        await accessManagementFrontPage.clickUser(recipient.name);
      });

      await test.step(`Gi ${recipient.name} fullmakt til enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.sokEtterEnkelttjeneste(service);
        await accessManagementFrontPage.clickEnkelttjeneste(service);
        await accessManagementFrontPage.clickGiFullmaktEnkelttjeneste();
        await accessManagementFrontPage.LukkGiFullmaktVindu();
      });

      await test.step(`${recipient.name} skal ha enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expandOrg(recipient.name);
        await accessManagementFrontPage.clickUser(recipient.name);
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.userCanDeleteEnkelttjeneste(service);
      });
    });
  });

  test.describe('Slett enkelttjenestedelegering hos person', () => {
    const {
      personer: [delegator, recipient],
    } = TESTDATA.personSlettHosPerson;

    test.beforeEach(async ({ api }) => {
      await api.connections.addConnection(delegator.pid, delegator.pid, recipient.pid);
      await api.connections.delegateSingleService(
        delegator.pid,
        delegator.pid,
        recipient.pid,
        service,
      );
    });

    test.afterEach(async ({ api }, testInfo) => {
      if (testInfo.status !== 'passed') {
        try {
          await api.connections.deleteSingleServiceDelegation(
            delegator.pid,
            delegator.pid,
            recipient.pid,
            service,
          );
        } catch (error) {
          console.error('Cleanup: Failed to delete single service delegation:', error);
        }
      }
      try {
        await api.connections.deleteConnection(delegator.pid, delegator.pid, [recipient.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });

    test('Slett enkelttjenestedelegering hos person', async ({
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(delegator.pid);
      });

      await test.step(`Velg deg selv (${delegator.name}) og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(delegator.name);
      });

      await test.step(`Gå til brukere-siden og klikk på "${recipient.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.name);
      });

      await test.step(`Slett "${service}" for ${recipient.name}`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickSlettEnkelttjeneste(service);
      });

      await test.step(`${recipient.name} skal ikke ha enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.name);
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.sokEtterEnkelttjeneste(service);
        await accessManagementFrontPage.expectEnkelttjenesteToBeDelegable(service);
      });
    });
  });

  test.describe('Slett enkelttjeneste hos virksomhet', () => {
    const {
      organisasjoner: [recipient],
      personer: [delegator],
    } = TESTDATA.personSlettHosVirksomhet;

    test.beforeEach(async ({ api }) => {
      await api.connections.addConnection(delegator.pid, delegator.pid, recipient.orgNo);
      await api.connections.delegateSingleService(
        delegator.pid,
        delegator.pid,
        recipient.orgNo,
        service,
      );
    });

    test.afterEach(async ({ api }, testInfo) => {
      if (testInfo.status !== 'passed') {
        try {
          await api.connections.deleteSingleServiceDelegation(
            delegator.pid,
            delegator.pid,
            recipient.orgNo,
            service,
          );
        } catch (error) {
          console.error('Cleanup: Failed to delete single service delegation:', error);
        }
      }
      try {
        await api.connections.deleteConnection(delegator.pid, delegator.pid, [recipient.orgNo]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });

    test('Slett enkelttjeneste hos virksomhet', async ({
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(delegator.pid);
      });

      await test.step(`Velg deg selv (${delegator.name}) og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(delegator.name);
      });

      await test.step(`Gå til brukere-siden og klikk på "${recipient.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expandOrg(recipient.name);
        await accessManagementFrontPage.clickUser(recipient.name);
      });

      await test.step(`Slett "${service}" for ${recipient.name}`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickSlettEnkelttjeneste(service);
      });

      await test.step(`${recipient.name} skal ikke ha enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expandOrg(recipient.name);
        await accessManagementFrontPage.clickUser(recipient.name);
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.sokEtterEnkelttjeneste(service);
        await accessManagementFrontPage.expectEnkelttjenesteToBeDelegable(service);
      });
    });
  });
});

test.describe('Enkelttjenestedelegering fra org til person og org til org', () => {
  test.describe('Deleger enkelttjeneste fra org til person', () => {
    const {
      organisasjoner: [delegator],
      personer: [recipient],
    } = TESTDATA.orgDelegerTilPerson;

    test.beforeEach(async ({ api }) => {
      await api.connections.addConnection(delegator.pid, delegator.orgNo, recipient.pid);
    });

    test.afterEach(async ({ api }) => {
      try {
        await api.connections.deleteSingleServiceDelegation(
          delegator.pid,
          delegator.orgNo,
          recipient.pid,
          service,
        );
      } catch (error) {
        console.error('Cleanup: Failed to delete single service delegation:', error);
      }
      try {
        await api.connections.deleteConnection(delegator.pid, delegator.orgNo, [recipient.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });

    test('Deleger enkelttjeneste fra org til person', async ({
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(delegator.pid);
      });

      await test.step(`Velg org ${delegator.name} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(delegator.name);
      });

      await test.step(`Gå til brukere-siden og klikk på "${recipient.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.name);
      });

      await test.step(`Gi ${recipient.name} fullmakt til enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.sokEtterEnkelttjeneste(service);
        await accessManagementFrontPage.clickEnkelttjeneste(service);
        await accessManagementFrontPage.clickGiFullmaktEnkelttjeneste();
        await accessManagementFrontPage.LukkGiFullmaktVindu();
      });

      await test.step(`${recipient.name} skal ha enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.name);
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.userCanDeleteEnkelttjeneste(service);
      });
    });
  });

  test.describe('Deleger enkelttjeneste fra org til org', () => {
    const {
      organisasjoner: [delegator, recipient],
    } = TESTDATA.orgDelegerTilVirksomhet;

    test.beforeEach(async ({ api }) => {
      await api.connections.addConnection(delegator.pid, delegator.orgNo, recipient.orgNo);
    });

    test.afterEach(async ({ api }) => {
      try {
        await api.connections.deleteSingleServiceDelegation(
          delegator.pid,
          delegator.orgNo,
          recipient.orgNo,
          service,
        );
      } catch (error) {
        console.error('Cleanup: Failed to delete single service delegation:', error);
      }
      try {
        await api.connections.deleteConnection(delegator.pid, delegator.orgNo, [recipient.orgNo]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });

    test('Deleger enkelttjeneste fra org til org', async ({
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(delegator.pid);
      });

      await test.step(`Velg org ${delegator.name} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(delegator.name);
      });

      await test.step(`Gå til brukere-siden og klikk på "${recipient.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expandOrg(recipient.name);
        await accessManagementFrontPage.clickUser(recipient.name);
      });

      await test.step(`Gi ${recipient.name} fullmakt til enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.sokEtterEnkelttjeneste(service);
        await accessManagementFrontPage.clickEnkelttjeneste(service);
        await accessManagementFrontPage.clickGiFullmaktEnkelttjeneste();
        await accessManagementFrontPage.LukkGiFullmaktVindu();
      });

      await test.step(`${recipient.name} skal ha enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expandOrg(recipient.name);
        await accessManagementFrontPage.clickUser(recipient.name);
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.userCanDeleteEnkelttjeneste(service);
      });
    });
  });

  test.describe('Slett enkelttjenestedelegering fra org til person', () => {
    const {
      organisasjoner: [delegator],
      personer: [recipient],
    } = TESTDATA.orgSlettHosPerson;

    test.beforeEach(async ({ api }) => {
      await api.connections.addConnection(delegator.pid, delegator.orgNo, recipient.pid);
      await api.connections.delegateSingleService(
        delegator.pid,
        delegator.orgNo,
        recipient.pid,
        service,
      );
    });

    test.afterEach(async ({ api }, testInfo) => {
      if (testInfo.status !== 'passed') {
        try {
          await api.connections.deleteSingleServiceDelegation(
            delegator.pid,
            delegator.orgNo,
            recipient.pid,
            service,
          );
        } catch (error) {
          console.error('Cleanup: Failed to delete single service delegation:', error);
        }
      }
      try {
        await api.connections.deleteConnection(delegator.pid, delegator.orgNo, [recipient.pid]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });

    test('Slett enkelttjenestedelegering fra org til person', async ({
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(delegator.pid);
      });

      await test.step(`Velg org ${delegator.name} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(delegator.name);
      });

      await test.step(`Gå til brukere-siden og klikk på "${recipient.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.name);
      });

      await test.step(`Slett "${service}" for ${recipient.name}`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickSlettEnkelttjeneste(service);
      });

      await test.step(`${recipient.name} skal ikke ha enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.clickUser(recipient.name);
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.sokEtterEnkelttjeneste(service);
        await accessManagementFrontPage.expectEnkelttjenesteToBeDelegable(service);
      });
    });
  });

  test.describe('Slett enkelttjeneste fra org til org', () => {
    const {
      organisasjoner: [delegator, recipient],
    } = TESTDATA.orgSlettHosVirksomhet;

    test.beforeEach(async ({ api }) => {
      await api.connections.addConnection(delegator.pid, delegator.orgNo, recipient.orgNo);
      await api.connections.delegateSingleService(
        delegator.pid,
        delegator.orgNo,
        recipient.orgNo,
        service,
      );
    });

    test.afterEach(async ({ api }, testInfo) => {
      if (testInfo.status !== 'passed') {
        try {
          await api.connections.deleteSingleServiceDelegation(
            delegator.pid,
            delegator.orgNo,
            recipient.orgNo,
            service,
          );
        } catch (error) {
          console.error('Cleanup: Failed to delete single service delegation:', error);
        }
      }
      try {
        await api.connections.deleteConnection(delegator.pid, delegator.orgNo, [recipient.orgNo]);
      } catch (error) {
        console.error('Cleanup: Failed to delete connection:', error);
      }
    });

    test('Slett enkelttjeneste fra org til org', async ({
      login,
      aktorvalgHeader,
      accessManagementFrontPage,
    }) => {
      await test.step('Logg inn', async () => {
        await login.LoginToAccessManagement(delegator.pid);
      });

      await test.step(`Velg org ${delegator.name} og gå til tilgangsstyring`, async () => {
        await aktorvalgHeader.selectActorFromHeaderMenu(delegator.name);
      });

      await test.step(`Gå til brukere-siden og klikk på "${recipient.name}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expandOrg(recipient.name);
        await accessManagementFrontPage.clickUser(recipient.name);
      });

      await test.step(`Slett "${service}" for ${recipient.name}`, async () => {
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickSlettEnkelttjeneste(service);
      });

      await test.step(`${recipient.name} skal ikke ha enkelttjenesten "${service}"`, async () => {
        await accessManagementFrontPage.goToUsers();
        await accessManagementFrontPage.expandOrg(recipient.name);
        await accessManagementFrontPage.clickUser(recipient.name);
        await accessManagementFrontPage.goToEnkelttjenester();
        await accessManagementFrontPage.clickGiFullmakt();
        await accessManagementFrontPage.sokEtterEnkelttjeneste(service);
        await accessManagementFrontPage.expectEnkelttjenesteToBeDelegable(service);
      });
    });
  });
});
