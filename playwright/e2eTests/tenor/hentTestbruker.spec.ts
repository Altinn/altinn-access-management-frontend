import { test, expect } from '../../fixture/pomFixture';
import { TenorApiRequests } from 'playwright/tenor/TenorApiRequests';

test.describe('Tenor testdatasøk', () => {
  test('henter en bosatt og myndig privatperson', async () => {
    const tenor = new TenorApiRequests();

    const person = await tenor.hentBosattMyndigPerson();

    expect(person.foedselsnummer).toMatch(/^\d{11}$/);
  });
});
