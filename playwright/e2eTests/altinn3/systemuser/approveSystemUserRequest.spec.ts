import { test, expect } from 'playwright/fixture/pomFixture';

import { TestdataApi } from 'playwright/util/TestdataApi';
import { ApiRequests } from 'playwright/api-requests/SystemUserApiRequests';
import { TenorTestData, type TenorDagligLederMedOrg } from 'playwright/tenor/TenorTestData';

// Leverandør + prebygd system er registrert infrastruktur (ikke Tenor). Kunde-
// virksomheten som forespørselen gjelder – og som logger inn for å godkjenne –
// hentes fra Tenor.
const vendorOrgNumber = '310547891';
const prebuiltSystemId = '310547891_E2E-Playwright-Authentication';

test.describe('Godkjenn og avvis Systembrukerforespørsel', () => {
  const tenor = new TenorTestData();
  let api: ApiRequests;
  let owner: TenorDagligLederMedOrg;
  let response: Awaited<ReturnType<ApiRequests['postSystemuserRequest']>>;

  test.beforeEach(async () => {
    api = new ApiRequests();
    owner = await tenor.dagligLederMedOrg();
    const externalRef = TestdataApi.generateExternalRef();
    response = await api.postSystemuserRequest(
      vendorOrgNumber,
      externalRef,
      prebuiltSystemId,
      owner.org.orgnr,
      'https://altinn.no/',
    );
  });

  test('Avvis Systembrukerforespørsel', async ({
    page,
    login,
    systemUserConfirmPage,
  }): Promise<void> => {
    await test.step('Navigate to confirmation page and login', async () => {
      await page.goto(response.confirmUrl);
      await login.loginNotChoosingActor(owner.dagligLeder.pid);
    });

    await test.step('Reject system user request', async () => {
      await systemUserConfirmPage.reject();
    });

    await test.step('Verify logout and rejection status', async () => {
      //Expect user to be logged out
      await expect(page).toHaveURL('https://info.altinn.no');

      //Read from status api to verify that status is not rejected after clicking "Avvis"
      const statusApiRequest = await api.getStatusForSystemUserRequest<{ status: string }>(
        vendorOrgNumber,
        response.id,
      );
      expect(statusApiRequest.status).toBe('Rejected');
    });
  });

  test('Godkjenn Systembrukerforespørsel', async ({
    page,
    login,
    systemUserConfirmPage,
  }): Promise<void> => {
    await test.step('Navigate to confirmation page and login', async () => {
      await page.goto(response.confirmUrl);
      await login.loginNotChoosingActor(owner.dagligLeder.pid);
    });

    await test.step('Approve system user request', async () => {
      await systemUserConfirmPage.approve();
    });

    await test.step('Verify logout and acceptance status', async () => {
      //Expect user to be logged out
      await expect(page).toHaveURL('https://info.altinn.no');

      //Read from status api to verify that status is not Accepted after clicking "Avvis"
      const statusApiRequest = await api.getStatusForSystemUserRequest<{ status: string }>(
        vendorOrgNumber,
        response.id,
      );
      expect(statusApiRequest.status).toBe('Accepted');
    });
  });
});
