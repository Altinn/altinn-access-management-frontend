import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/test';

export class runAccessibilityTests {
  static brukerflateEnkelttjenesteDelegeringUU: any;
  constructor(public page: Page) {}

  async brukerflateEnkelttjenesteDelegering() {
    await this.page.goto(process.env.BRUKER_FLATE_URL as string);

    //run accessibility tests test on page
    const results = await new AxeBuilder({ page: this.page }).include('body').analyze();

    // Check if any violations are found
    if (results.violations.length > 0) {
      console.log(`Found ${results.violations.length} accessibility violations`);

      // Iterate over the violations and log details
      for (const violation of results.violations) {
        console.log(`Violation: ${violation.id}`);
        console.log(`Description: ${violation.description}`);
        console.log(`Impact: ${violation.impact}`);
        console.log(`Help URL: ${violation.helpUrl}`);

        // For each violation, highlight the affected elements
        for (const node of violation.nodes) {
          const targets = node.target;

          // Check if the target is a valid string selector
          if (Array.isArray(targets)) {
            for (const target of targets) {
              if (typeof target === 'string') {
                try {
                  await this.page.locator(target).evaluate((el) => {
                    el.style.outline = '2px solid red'; // Red outline for highlighted elements
                  });
                } catch (error) {
                  console.error(`Error highlighting target ${target}: ${error}`);
                }
              } else {
                console.log('Skipping invalid target (not a string):', target);
              }
            }
          }
        }
      }

      // Take a screenshot of the page with highlighted elements
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotPath = `accessibility-violation-${timestamp}.png`;
      await this.page.screenshot({ path: screenshotPath });

      console.log(`Screenshot saved as ${screenshotPath}`);
    } else {
      console.log('No accessibility violations found!');
    }

    // Assert no accessibility violations
    expect(results.violations.length).toBe(0);
  }
}
