# Playwright E2E Tests — Guidelines

## Locators

Use Playwright's built-in locators. They have auto-waiting and retry built in.

**Priority order:**
1. `getByRole()` — always preferred, reflects what users and assistive technology see
2. `getByText()` — for non-interactive elements like labels, badges, org numbers
3. `getByLabel()`, `getByPlaceholder()`, `getByTitle()` — for form inputs
4. `getByTestId()` — last resort if nothing else works

**Never use CSS selectors or XPath.** They break when the DOM changes and say nothing about user-visible behavior.

```ts
// Bad
page.locator('span[data-variant="subtle"]', { hasText: 'Din virksomhet' })
page.locator('.button-primary')

// Good
page.getByText('Din virksomhet', { exact: true })
page.getByRole('button', { name: 'Godkjenn' })
```

When a locator matches multiple elements, narrow it by chaining or filtering rather than using `.first()` or indexes:

```ts
// Bad — fragile, relies on DOM order
page.getByRole('button', { name: /^Legg til/ }).first()

// Good — scoped to the relevant list item
page.getByRole('listitem')
  .filter({ has: page.getByRole('heading', { name: orgName, level: 3 }) })
  .getByText(formattedOrgNo, { exact: true })
```

## Assertions

Use web-first assertions. They wait and retry automatically.

```ts
// Bad — evaluates immediately, no retry -- deprecated
expect(await element.isVisible()).toBe(true)

// Good — retries until condition is met or timeout
await expect(page.getByText('welcome')).toBeVisible()
```

Use `expect.soft()` when you want to verify multiple things in the same test and see all failures at once, not just the first.

## Fixtures — pomFixture.ts

All page object classes must be registered in `playwright/fixture/pomFixture.ts`. Tests import `{ test, expect }` from `playwright/fixture/pomFixture` (never directly from `@playwright/test`) and receive page objects via fixture arguments — never instantiate them manually inside tests or `beforeEach`.

```ts
// Bad — manual instantiation in the test
import { ClientDelegationPage } from 'playwright/pages/systemuser/ClientDelegation';
const clientDelegationPage = new ClientDelegationPage(page);

// Good — via fixture
test('my test', async ({ clientDelegationPage }) => { ... });
```

When adding a new page object class:
1. Import it in `pomFixture.ts`
2. Add it to the `Fixtures` type
3. Register it with `async ({ page }, use) => { await use(new MyPage(page)); }`

`beforeEach` hooks that only do API setup don't need `page` — omit it from the destructured args if unused.

## Page Object Model

All locators and page interactions live in page objects under `playwright/pages/`. Tests should not contain raw locators.

- One file per page/feature area
- Constructor defines all fixed locators as `readonly` properties
- Dynamic locators (parameterized by name, org number, etc.) are methods that return `Locator`
- Page objects do not make assertions — that belongs in the test

## Test isolation

Each test must be fully independent. Never rely on state left by a previous test.

- Set up all required data in `beforeEach` via API calls
- Clean up in `afterEach` via API calls — not in the test body
- Wrap each cleanup step in its own `try/catch` so one failure doesn't prevent others

```ts
test.afterEach(async ({}, testInfo) => {
  if (testInfo.status === 'passed') return;

  try {
    await api.deleteAgentSystemUser(systemId, partyOrgNo, externalRef, managerPid);
  } catch (error) {
    console.error('Cleanup: Failed to delete agent system user:', error);
  }
  try {
    await api.deleteSystemInSystemRegister(name);
  } catch (error) {
    console.error('Cleanup: Failed to delete system from system register:', error);
  }
});
```

Skip cleanup when the test passed — if the test includes a UI deletion step, that already handled it. API cleanup is a fallback for failed runs only. This avoids 404 log spam and makes failure-only cleanup explicit.

If a test has no UI deletion step and cleanup should always run, omit the `status` check.

## API setup

Prefer API calls over UI for setup and teardown. Tests should only use the browser for what actually needs browser verification.

- Use `ApiRequests` for system register and system user CRUD
- Use `EnduserConnection` for org-to-org delegation setup
- Track `systemId` and `externalRef` at describe scope so `afterEach` can use them

## Test data — never share or reuse

**Each test run must create its own test data from scratch and clean it up afterwards.**

This is especially critical for anything involving the connections API (`EnduserConnection`) or access package delegations (tilgangspakker). These operations mutate shared state in Altinn — delegations, system users, and connections persist across runs if not cleaned up. If two tests share the same org numbers, PIDs, or system IDs, they will interfere with each other when run in parallel or back-to-back.

Concrete rules:

- **Never assume a delegation or connection is absent at test start.** Set it up explicitly, even if a previous test run should have left it in that state.
- **Access package delegations via `EnduserConnection` are not automatically cleaned up.** If your test adds a connection or delegates a package, verify in `afterEach` whether it needs to be removed — otherwise it accumulates across runs and can cause unexpected state for other tests using the same org numbers.
- **Each spec file must use its own dedicated org numbers and PIDs.** Because tests run in parallel, two spec files using the same `partyOrgNo` will see each other's delegations and system users simultaneously. Assign a unique org/PID pair per spec file and never share them across files. The `beforeEach`/`afterEach` lifecycle ensures the same org can be safely reused across runs of the same spec — but only because no other spec is touching that org at the same time.

## Test inputs

- Generate unique system names per run: `Playwright-e2e-${featureName}-${Date.now()}`
- Avoid `Math.random()` in names — `Date.now()` is sufficient for uniqueness
- Use fixed or well-known test data for org numbers and PIDs — do not generate these randomly
- If varying inputs across runs is intentional (e.g. rotating access packages), keep the set small and fully documented

## Structure

```text
playwright/
  api-requests/   # API clients for setup/teardown
  pages/          # Page Object Model classes
  fixture/        # Playwright fixtures (pomFixture.ts)
  e2eTests/       # Spec files — one feature per file
  uuTests/        # Accessibility tests
  util/           # Helpers (env, token generation, etc.)
  config/         # .env files per environment
```

Spec files follow `test.describe` → `test.beforeEach` → `test.afterEach` → `test()` order.

Use `test.step()` to label logical phases within a test. This makes trace viewer output readable.
