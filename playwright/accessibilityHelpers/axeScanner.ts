import type { Page, TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { AxeResults } from 'axe-core';

import { collectScanMetadata, renderAccessibilityReport } from './accessibilityReport';
import type { TestReportContext } from './reportContext';

// Contrast checks must use final colors, rather than an opening transition.
async function waitForAnimations(page: Page) {
  await page.evaluate(async () => {
    const animations = Promise.all(
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation.playState === 'running' &&
            Number.isFinite(animation.effect?.getComputedTiming().endTime),
        )
        .map((animation) => animation.finished.catch(() => {})),
    );
    await Promise.race([animations, new Promise((resolve) => setTimeout(resolve, 2000))]);
  });
}

function runAxe(page: Page) {
  const builder = new AxeBuilder({ page })
    .options({ resultTypes: ['violations', 'incomplete'] })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']);
  // #2509: avoid copying huge intermediate results between pages when there are no iframes.
  if (page.frames().length === 1) builder.setLegacyMode();
  return builder.analyze();
}

/** Draws a temporary red outline + label over each violation's element, for the marked screenshot. */
async function withViolationMarkers<T>(
  page: Page,
  violations: AxeResults['violations'],
  takeScreenshot: () => Promise<T>,
): Promise<T> {
  try {
    await page.evaluate((violations) => {
      const overlay = document.createElement('div');
      overlay.id = 'uu-findings-overlay';
      overlay.setAttribute('popover', 'manual');
      overlay.style.cssText =
        'position:absolute;inset:0;margin:0;padding:0;border:0;width:100%;height:100%;background:transparent;overflow:visible;pointer-events:none;z-index:2147483647';
      violations.forEach((violation, index) => {
        violation.nodes.forEach((node) => {
          if (node.target.length !== 1 || typeof node.target[0] !== 'string') return;
          const element = document.querySelector(node.target[0]);
          if (!element) return;
          const rect = element.getBoundingClientRect();
          const marker = document.createElement('div');
          const gap = 3;
          const minimumSize = 12;
          // rect is relative to the viewport; the overlay uses page coordinates.
          // Leave a gap on both sides and keep tiny targets visible in the screenshot.
          Object.assign(marker.style, {
            position: 'absolute',
            left: `${rect.left + scrollX - gap}px`,
            top: `${rect.top + scrollY - gap}px`,
            width: `${Math.max(rect.width, minimumSize) + 2 * gap}px`,
            height: `${Math.max(rect.height, minimumSize) + 2 * gap}px`,
            outline: '3px solid #d00000',
          });
          const label = document.createElement('span');
          label.textContent = `${index + 1}: ${violation.id}`;
          label.style.cssText =
            'position:absolute;bottom:100%;left:0;background:#d00000;color:white;font:12px sans-serif;padding:3px;white-space:nowrap';
          marker.append(label);
          overlay.append(marker);
        });
      });
      document.body.append(overlay);
      overlay.showPopover();
    }, violations);
    return await takeScreenshot();
  } finally {
    await page.evaluate(() => document.getElementById('uu-findings-overlay')?.remove());
  }
}

/** Scan the current page's state with axe and attach results/screenshot/report to the test. */
export async function scanPage(
  page: Page,
  testInfo: TestInfo,
  reportContext: TestReportContext,
  name: string,
): Promise<{ scanned: boolean }> {
  if (page.isClosed() || !new URL(page.url()).pathname.startsWith('/accessmanagement/ui'))
    return { scanned: false };
  await page.bringToFront();
  await waitForAnimations(page);
  const results = await runAxe(page);
  // Axe uses a temporary page to aggregate results; restore the test page.
  await page.bringToFront();

  // Keep findings in the report without failing the functional test.
  await testInfo.attach(`${name}-axe-results`, {
    body: JSON.stringify(results),
    contentType: 'application/json',
  });
  // The screenshot is embedded in the HTML report only, to keep report size down.
  const takeScreenshot = () => page.screenshot({ fullPage: true, timeout: 5000 });
  const screenshot = results.violations.length
    ? await withViolationMarkers(page, results.violations, takeScreenshot)
    : await takeScreenshot();
  const metadata = await collectScanMetadata(testInfo, page, name);
  await testInfo.attach(`${name}-scan-metadata`, {
    body: JSON.stringify(metadata),
    contentType: 'application/json',
  });
  await testInfo.attach(`${name}-uu-report`, {
    body: renderAccessibilityReport(results, screenshot, metadata, reportContext.get()),
    contentType: 'text/html',
  });

  for (const violation of results.violations) {
    testInfo.annotations.push({
      type: 'UU-funn',
      description: `${name}: ${violation.id} — ${violation.help}`,
    });
  }
  return { scanned: true };
}
