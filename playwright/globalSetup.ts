import { chromium, expect } from '@playwright/test';

import { ApiClient } from 'playwright/api-requests';
import { fromPersons } from 'playwright/e2eTests/altinn3/consent/helper/consentTestdata';
import { LoginPage } from 'playwright/pages/LoginPage';
import { currentEnv, env } from 'playwright/util/helper';

/**
 * Varmer opp miljøet før testene starter.
 *
 * Den nattlige kjøringen 15.10 feilet bare de første ~6 minuttene, i både AT23
 * og TT02, og de samme testene besto på retry på 7–15 sekunder. Det ligner
 * kaldstart, så vi går gjennom en innlogging og en samtykkeside én gang før
 * workerne starter.
 *
 * Kun i CI, så lokale kjøringer ikke blir tregere (`OPPVARMING=true` for å
 * tvinge den på). Feil logges, men stopper aldri suiten: oppvarmingen er ikke
 * en test.
 */
const VARMUP_TIMEOUT_MS = 90_000;

async function timet(navn: string, steg: () => Promise<unknown>): Promise<void> {
  const start = Date.now();
  try {
    await steg();
    console.log(`Oppvarming: ${navn} tok ${((Date.now() - start) / 1000).toFixed(1)}s`);
  } catch (error) {
    const melding = error instanceof Error ? error.message.split('\n')[0] : String(error);
    console.warn(
      `Oppvarming: ${navn} feilet etter ${((Date.now() - start) / 1000).toFixed(1)}s: ${melding}`,
    );
  }
}

export default async function globalSetup(): Promise<void> {
  if (!process.env.CI && process.env.OPPVARMING !== 'true') return;

  const pid = fromPersons[0];
  const api = new ApiClient();
  console.log(`Oppvarming av ${currentEnv()} ...`);

  await Promise.all([
    timet('authorizedparties (API)', () => api.authorizedParties.antallAktoererForbruker(pid)),
    timet('innlogging og samtykkeside (nettleser)', async () => {
      const browser = await chromium.launch();
      try {
        const page = await browser.newPage();
        page.setDefaultTimeout(VARMUP_TIMEOUT_MS);
        await page.goto(env('BASE_URL'));
        await new LoginPage(page, api).loginNotChoosingActor(pid);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible({
          timeout: VARMUP_TIMEOUT_MS,
        });
        await page.goto(`${env('BASE_URL')}/consent/active`);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible({
          timeout: VARMUP_TIMEOUT_MS,
        });
      } finally {
        await browser.close();
      }
    }),
  ]);
}
