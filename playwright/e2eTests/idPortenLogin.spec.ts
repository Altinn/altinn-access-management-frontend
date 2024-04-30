/* eslint-disable import/default */
/* eslint-disable import/no-named-as-default-member */
import { chromium, test } from '@playwright/test';

test('Login with TestID', async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log(process.env.BASE_URL);
  await page.goto(process.env.BASE_URL as string);
  await page.click("'Logg inn/Min profil'");
  await page.click('//*[@id="testid1"]');
  await page.getByLabel('Personidentifikator (').fill('03857298151');
  await page.getByRole('button', { name: 'Autentiser' }).click();

  //to open new tab in same window
  //const page1 = await context.newPage();
  //await page1.goto(process.env.BASE_URL as string);

  //to open session in incognito mode

  const newContext = await browser.newContext();
  const newPage = await newContext.newPage();
  await newPage.goto(process.env.BASE_URL as string);
});
