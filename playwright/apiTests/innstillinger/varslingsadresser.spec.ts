// Imported from @playwright/test rather than the pomFixture: these tests need
// no browser, and the fixture's auto `slowNetwork` fixture would start one.
import { expect, test } from '@playwright/test';

import { SettingsApiRequests } from '../../api-requests/SettingsApiRequests';

/**
 * Varslingsadresser — rules and error cases, at API level.
 *
 * The GUI spec (e2eTests/altinn3/innstillinger) keeps one happy path and the
 * role check, which is what genuinely needs a browser: that the control exists,
 * is shown to the right role, and reaches the right endpoint. Everything below
 * is behaviour the backend owns, so it is asserted here — faster, and without a
 * browser's worth of things that can go wrong.
 *
 * Each describe still uses its OWN organisation: these mutate notification
 * addresses and the suite runs fully parallel.
 */
const ACTORS = {
  sms: { pid: '24856398710', org: '312939053', orgName: 'KULTURELL UPOPULÆR TIGER AS' },
  endre: { pid: '23885997783', org: '210486372', orgName: 'NYSGJERRIG FORNEM PUMA BBL' },
  slett: { pid: '11863047716', org: '214240432', orgName: 'FORSTÅELSESFULL LOGISK TIGER AS' },
  sisteAdresse: { pid: '22856996909', org: '313363376', orgName: 'REFLEKTERENDE IHERDIG TIGER AS' },
};

const BASELINE_EPOST = 'playwright-baseline@example.com';

test.describe('Varslingsadresser - API', () => {
  const api = new SettingsApiRequests();

  test.describe('legg til SMS-adresse', () => {
    const actor = ACTORS.sms;
    const nyttNummer = { countryCode: '+47', phone: '99999999' };

    test.beforeEach(async () => {
      await api.setNotificationAddresses(actor.pid, actor.org, {
        emails: [BASELINE_EPOST],
        phones: [],
      });
    });

    test('SMS-adresse lagres med landskode', async () => {
      await api.addSmsNotificationAddress(
        actor.pid,
        actor.org,
        nyttNummer.countryCode,
        nyttNummer.phone,
      );

      const addresses = await api.getNotificationAddresses(actor.pid, actor.org);
      expect(
        addresses.some(
          (a) => a.phone === nyttNummer.phone && a.countryCode === nyttNummer.countryCode,
        ),
      ).toBe(true);
    });

    test.afterEach(async () => {
      try {
        await api.setNotificationAddresses(actor.pid, actor.org, {
          emails: [BASELINE_EPOST],
          phones: [],
        });
      } catch (error) {
        console.error('Cleanup: Failed to reset notification addresses:', error);
      }
    });
  });

  test.describe('endre e-postadresse', () => {
    const actor = ACTORS.endre;
    const endretEpost = 'playwright-endret@example.com';

    test.beforeEach(async () => {
      await api.setNotificationAddresses(actor.pid, actor.org, { emails: [BASELINE_EPOST] });
    });

    test('endring erstatter adressen i stedet for å legge til en ny', async () => {
      const before = await api.getNotificationAddresses(actor.pid, actor.org);
      expect(before).toHaveLength(1);

      await api.setNotificationAddresses(actor.pid, actor.org, { emails: [endretEpost] });

      const after = await api.getNotificationAddresses(actor.pid, actor.org);
      expect(after).toHaveLength(1);
      expect(after[0].email).toBe(endretEpost);
    });

    test.afterEach(async () => {
      try {
        await api.setNotificationAddresses(actor.pid, actor.org, { emails: [BASELINE_EPOST] });
      } catch (error) {
        console.error('Cleanup: Failed to reset notification addresses:', error);
      }
    });
  });

  test.describe('slett e-postadresse', () => {
    const actor = ACTORS.slett;
    const ekstraEpost = 'playwright-skal-slettes@example.com';

    test.beforeEach(async () => {
      await api.setNotificationAddresses(actor.pid, actor.org, {
        emails: [BASELINE_EPOST, ekstraEpost],
      });
    });

    test('sletting fjerner kun den valgte adressen', async () => {
      const before = await api.getNotificationAddresses(actor.pid, actor.org);
      expect(before).toHaveLength(2);
      const toDelete = before.find((a) => a.email === ekstraEpost);
      expect(toDelete).toBeDefined();

      await api.deleteNotificationAddress(actor.pid, actor.org, toDelete!.notificationAddressId);

      const after = await api.getNotificationAddresses(actor.pid, actor.org);
      expect(after).toHaveLength(1);
      expect(after[0].email).toBe(BASELINE_EPOST);
    });

    test.afterEach(async () => {
      try {
        await api.setNotificationAddresses(actor.pid, actor.org, { emails: [BASELINE_EPOST] });
      } catch (error) {
        console.error('Cleanup: Failed to reset notification addresses:', error);
      }
    });
  });

  test.describe('kan ikke fjerne den siste adressen', () => {
    const actor = ACTORS.sisteAdresse;

    test.beforeEach(async () => {
      // Exactly one address of either type, so deleting it would leave the
      // organisation with none — which is what the rule forbids.
      await api.setNotificationAddresses(actor.pid, actor.org, {
        emails: [BASELINE_EPOST],
        phones: [],
      });
    });

    test('sletting av virksomhetens eneste adresse avvises', async () => {
      const addresses = await api.getNotificationAddresses(actor.pid, actor.org);
      expect(addresses).toHaveLength(1);

      await expect(
        api.deleteNotificationAddress(actor.pid, actor.org, addresses[0].notificationAddressId),
      ).rejects.toThrow(/Status: 409/);

      // And the address is still there afterwards.
      const after = await api.getNotificationAddresses(actor.pid, actor.org);
      expect(after).toHaveLength(1);
      expect(after[0].email).toBe(BASELINE_EPOST);
    });

    test.afterEach(async () => {
      try {
        await api.setNotificationAddresses(actor.pid, actor.org, {
          emails: [BASELINE_EPOST],
          phones: [],
        });
      } catch (error) {
        console.error('Cleanup: Failed to reset notification addresses:', error);
      }
    });
  });
});
