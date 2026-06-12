import { expect } from '@playwright/test';

import { test } from '../../fixture/pomFixture';
import { TenorApiRequests } from 'playwright/tenor/TenorApiRequests';

test.describe('Tenor testdatasøk', () => {
  test('henter en bosatt og myndig privatperson', async () => {
    const tenor = new TenorApiRequests();

    const person = await tenor.hentBosattMyndigPerson();

    // eslint-disable-next-line no-console
    console.log('Tenor testperson:', person.foedselsnummer);

    expect(person.foedselsnummer).toMatch(/^\d{11}$/);
  });
});
