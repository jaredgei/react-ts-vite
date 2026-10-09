# React Template

An opinionated starter for React frontends: **React 19 + TypeScript + Vite**, styled with **CSS modules** and design tokens, tested with **Vitest**, and linted/formatted out of the box. It ships with a small set of commonly used hooks, contexts, components, and app patterns so a new project starts with real building blocks instead of a blank page.

![CI](https://github.com/jaredgei/react-ts-vite/actions/workflows/ci.yml/badge.svg)

## Stack

- **React 19** with `react-router` v8 (data router, lazy routes)
- **TypeScript** in strict mode (`verbatimModuleSyntax`, `noUncheckedIndexedAccess`)
- **Vite** for dev/build, with an `@/`-relative import alias
- **CSS modules** with custom-property design tokens, compiled by **Lightning CSS** (nesting, `color-mix`, prefixing)
- **Vitest** + **@testing-library/react** for tests
- **ESLint** (flat config, type-aware, with React Hooks, React Refresh, and `jsx-a11y` rules) + **Prettier**

## Getting started

Requires Node 22.22+ (pinned in `.nvmrc`).

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:5173`.

## Backend proxy

The Vite dev server proxies requests starting with `/api` to a backend at `http://localhost:8008` (configured in `vite.config.ts` under `server.proxy`). This keeps API calls same-origin, so session cookies work without CORS. Make sure the `target` port matches the port your backend actually listens on, and update it if either side changes.

## Scripts

| Script                 | Description                          |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Start the Vite dev server            |
| `npm run build`        | Type-check and build for production  |
| `npm run preview`      | Preview the production build locally |
| `npm run typecheck`    | Run `tsc` with no emit               |
| `npm run lint`         | Run ESLint                           |
| `npm run format`       | Auto-fix formatting with Prettier    |
| `npm run format:check` | Check formatting without writing     |
| `npm run test`         | Run the test suite once              |
| `npm run test:watch`   | Run tests in watch mode              |

## Project structure

```
src/
  assets/        Static assets
  components/    Reusable UI components
  context/       Contexts and hooks (`Foo.ts`) with their providers (`FooProvider.tsx`)
  hooks/         Custom React hooks
  pages/         Routed page views
  styles/        Global styles, design tokens, and CSS modules
  tests/         Vitest test suites, mirroring the source layout
  utilities/     Shared helpers, tools, and utility modules
  App.tsx        Router provider
  Providers.tsx  Shared context/error-boundary tree
  main.tsx       Application entry point
  routes.tsx     Route configuration (lazy-loaded pages)
```

Imports use the `@/` alias (defined by `paths` in `tsconfig.json` and honored by Vite), so modules are imported as `@/components/Button`, `@/hooks/useViewportTracker`, `@/styles/App.css`, etc.

## What's included

- **Type-safe context** — `createSafeContext` builds a context plus a hook that throws a clear error when used outside its provider.
- **Layered error handling** — a real `ErrorBoundary` (catches render crashes), a `RouteError` element for thrown route errors, a `NotFound` page for unmatched routes, and an `ErrorBanner` fed by `useError().showError(unknown)`. Every surface uses one policy (`toDisplayMessage`): strings and `ApiError` messages from the backend are shown as-is, while any other error's details appear only in development, so internals never leak in production. The banner clears on navigation and on each new form submission.
- **Performant global hooks** — `useViewportTracker` (shared scroll/resize store via `useSyncExternalStore`, lazily subscribed and `requestAnimationFrame`-coalesced), `useElementRect` for measuring elements, and `useKeyPressed` built on `useEffectEvent`.
- **Native platform UI** — `Modal` uses `<dialog>` (`showModal`, focus trapping, top layer, `::backdrop`), and `Suggestions`/`Dropdown`/`VerticalMenu` use the Popover API for light dismiss and Escape, with CSS `@starting-style` transitions. Menus support arrow-key/Home/End navigation, focus their first item on open, and return focus to the trigger on close.
- **Accessible defaults** — WCAG AA contrast for the palette, `prefers-reduced-motion` honored globally, labelled `Spinner`/`Toggle`/`Modal`, and `autocomplete` hints on auth forms.
- **CSS modules with tokens** — colors, spacing, fonts, radii, z-indexes, durations, and a `--blur` glass effect live as custom properties in `@/styles/tokens.css`.
- **API client** — `@/utilities/api` wraps `fetch` with `get`/`post`/`put`/`patch`/`del`, `credentials: 'include'`, optional `params` and `signal` (`AbortSignal`), an `ApiError` carrying the status and the backend's `errors` messages (network failures become `ApiError` with status `0`; aborts are rethrown untouched), and `setUnauthorizedHandler` to clear the session on any 401. Response bodies are typed by the caller, not validated at runtime; add a schema parser at the call site for untrusted shapes.
- **Session authentication** — `AuthProvider`/`useAuth` bootstrap the session from `/api/users/me` (a 401 means logged out; any other failure is surfaced). Login/Register use React 19 `<form action>` + `useActionState`. `routes.tsx` guards routes: `/` swaps `Home`/`Dashboard`, guest-only routes (`/login`, `/register`) redirect when signed in, and protected routes (`/settings`) redirect to `/login`, then return to the full original location (path, query, and hash; same-origin only). Guards are UX only — the backend session enforces access on every request.

## Testing

Tests live in `src/tests/`, mirroring the source layout, which keeps the source tree free of test files.

```bash
npm run test        # run once
npm run test:watch  # watch mode
```

## Continuous integration

`.github/workflows/ci.yml` runs on every push to `main` and on all pull requests with a read-only token and SHA-pinned actions. It installs from the lockfile with `npm ci`, then runs, in order:

```
audit (production deps) → lint → format:check → test → build (includes typecheck)
```

## Security

The frontend is one layer; these must also hold where the app is deployed:

- **Sessions** — use an `HttpOnly`, `Secure`, `SameSite=Lax` (or `Strict`) cookie. The client never reads or stores tokens.
- **CSRF** — `SameSite` alone is not sufficient for every case; the backend should also verify `Origin`/`Sec-Fetch-Site` on state-changing requests.
- **Content Security Policy** — serve `index.html` with a CSP such as `default-src 'self'; img-src 'self' data:; style-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'`, plus `X-Content-Type-Options: nosniff` and `Referrer-Policy: strict-origin-when-cross-origin`. The production build has no inline scripts, so no `unsafe-inline` is needed.
- **Secrets** — anything in `import.meta.env` is shipped to the browser. Never put secrets in `VITE_*` variables.

## AI agents

An [AGENTS.md](./AGENTS.md) is included so AI coding agents produce code that matches this project's conventions.
