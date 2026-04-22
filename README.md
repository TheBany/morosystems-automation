# MoroSystems Automation Test Case

End-to-end automation for the MoroSystems website and a companion API test
suite for the todo-be backend. Built with Playwright and TypeScript.

## Prerequisites

- Node.js 18+
- Git

## Installation

```bash
git clone https://github.com/TheBany/morosystems-automation.git
cd morosystems-automation
npm install
npx playwright install
```

The last command installs the browser binaries Playwright needs (Chromium,
Firefox, WebKit).

## Running the tests

Run everything (except API — see below):

```bash
npx playwright test
```

Run only functional GUI tests:

```bash
npx playwright test tests/gui/
```

Run only visual regression tests:

```bash
npx playwright test tests/visual/
```

Run against a specific browser project:

```bash
npx playwright test --project=chromium
```

View the HTML report after a run:

```bash
npx playwright show-report
```

Update visual baselines (after intentional UI changes):

```bash
npx playwright test tests/visual/ --update-snapshots
```

### Running API tests

API tests run against a local instance of `morosystems/todo-be`. Start it
in a separate terminal before running the tests:

```bash
git clone https://github.com/morosystems/todo-be
cd todo-be
npm install
npm start
```

The backend listens on `http://localhost:8080`. Then in the test project:

```bash
npx playwright test --project=api
```

## Project structure

```
api/
  generated/                Auto-generated API client (@hey-api/openapi-ts)
  TasksClient.ts            Typed wrapper around Playwright request
fixtures/
  googleSearchMock.ts       Google search response mock
pages/                      Page Object Model classes
  GooglePage.ts
  MoroSystemsPage.ts
  KarieraPage.ts
tests/
  api/                      API tests (todo-be)
  gui/                      Functional GUI tests (all browsers and viewports)
  visual/                   Visual regression tests (Chromium-based only)
playwright.config.ts        Test runner configuration
tsconfig.json               TypeScript configuration
```

## Design notes

### Why Google search is mocked

The test specification requires searching for "MoroSystems" on Google and
clicking the result link. In practice, Google aggressively blocks automated
browser traffic via reCAPTCHA — especially on emulated mobile viewports —
making any test that hits live Google unreliable.

Rather than relying on fragile workarounds (stealth plugins, paid CAPTCHA
solving services, or retry-until-it-works patterns), the test intercepts
Google search requests using Playwright's `page.route()` API and returns a
generated results page.

The test still validates the full user journey:

- Search results page displays a link to morosystems.cz
- Clicking the link navigates to MoroSystems
- Everything after that hits the real MoroSystems site

What is intentionally not tested:

- That Google's actual search engine returns MoroSystems

The mock lives in `fixtures/googleSearchMock.ts` and generates HTML
programmatically so test data stays typed and refactorable alongside the
rest of the codebase.

### API client generation (OpenAPI codegen)

The `todo-be` backend exposes an OpenAPI 3 specification at
`http://localhost:8080/v3/api-docs`. Rather than hand-writing types for
every endpoint, the project uses [`@hey-api/openapi-ts`](https://heyapi.dev/)
to generate a fully typed TypeScript client from the spec.

The generated code lives in `api/generated/` and is committed to the
repository.

To regenerate (e.g. after the backend API changes):

```bash
npx @hey-api/openapi-ts -i http://localhost:8080/v3/api-docs -o ./api/generated -c @hey-api/client-fetch
```

In the tests themselves we use Playwright's `APIRequestContext` for actual
HTTP calls (for native tracing and reporting integration), but we import the
generated `Task`, `CreateTask`, and `UpdateTask` types. That gives us full
type safety without giving up Playwright's built-in debugging features.

### API test coverage

Coverage focuses on the four CRUD operations required by the assignment,
plus `GET /tasks/completed` and several negative tests for input validation.
The `complete` and `incomplete` endpoints are intentionally left untested.

### Visual regression baselines

Playwright's visual comparison is platform-sensitive — font rendering,
sub-pixel antialiasing, and scrollbars render differently across OS, so
each platform needs its own baseline.

Committed baselines:

- **Windows** (`*-win32.png`) — generated in the development environment
- **Linux** (`*-linux.png`) — generated and committed by CI *(planned)*

Running the suite on Windows or in CI (Linux) performs real pixel-level
comparison against committed baselines. On other platforms (e.g. macOS),
Playwright automatically generates a local baseline on first run via
`updateSnapshots: 'missing'`. Subsequent runs compare against it.

Trade-off: the first run on an uncommitted platform (e.g. macOS) cannot
catch a visual regression — there's nothing to compare against yet.
From the second run onward, local visual regression works normally.

For a production-grade setup everything would run inside the Playwright
Docker image, eliminating the per-platform baseline split entirely. I
skipped Docker here to keep the setup lightweight, but it would be the
first improvement I'd make for a long-lived project.

### Parallelization and retries

The test runner is configured with 4 parallel workers locally and 1 retry
per failed test.

During development I observed that running the full matrix of tests (all
browsers × all viewports) against the production morosystems.cz occasionally
triggers server-side throttling — individual requests time out even though
the test logic is correct.

The configuration reflects this:

- `workers: 4` — demonstrates parallel execution while keeping request
  volume low enough to avoid throttling under normal runs
- `retries: 1` — absorbs the rare request that gets throttled; on CI this
  is bumped to 2 for extra safety
- For stress testing (e.g. `--repeat-each=10`) the site will throttle
  aggressively; this is expected and not a test-suite defect

## CI/CD

_To be added_
