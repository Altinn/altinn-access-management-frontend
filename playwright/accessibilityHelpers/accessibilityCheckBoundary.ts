import type { TestInfo } from '@playwright/test';

/** UU failures are warnings; functional assertions stay outside this boundary. */
export async function runOptionalCheck(
  testInfo: TestInfo,
  enabled: boolean,
  name: string,
  check: () => Promise<void>,
) {
  if (!enabled) return;
  try {
    await check();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    testInfo.annotations.push({ type: 'UU-feil', description: `${name}: ${message}` });
    console.warn(`UU-feil (${name}): ${message}`);
    try {
      await testInfo.attach(`${name}-uu-error`, {
        body: JSON.stringify({ name, message }),
        contentType: 'application/json',
      });
    } catch {
      // The annotation and console warning remain if attachments cannot be written.
    }
  }
}
