/* eslint-disable import/default */
/* eslint-disable import/no-named-as-default-member */
import { test } from '@playwright/test';

test('Login with TestID', async ({ page }) => {
  console.log(process.env.BASE_URL);
  await page.goto(process.env.BASE_URL as string);
  await page.click("'Logg inn/Min profil'");
  await page.click('//*[@id="testid1"]');
  await page.getByLabel('Personidentifikator (').fill('03857298151');
  await page.getByRole('button', { name: 'Autentiser' }).click();
});
