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

### Environment variables

[`.env`](./.env) is committed with local-development defaults; put personal overrides in the gitignored `.env.local`. `VITE_TURNSTILE_SITE_KEY` is the [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) site key for the registration challenge; the committed value is Cloudflare's always-pass test key. Set the real one per environment at build time.

## Backend proxy

The Vite dev server proxies requests starting with `/api` to a backend at `http://localhost:8008` (configured in `vite.config.ts` under `server.proxy`). This keeps API calls same-origin, so session cookies work without CORS. Make sure the `target` port matches the port your backend actually listens on, and update it if either side changes.

It pairs with [express-ts-template](https://github.com/jaredgei/express-ts-template), whose routes it calls and whose OpenAPI document its API types come from. After changing a route there, regenerate them into this repo:

```bash
npm run api:types -- ../<this repo>/src/types/api.ts        # once
npm run api:types:watch -- ../<this repo>/src/types/api.ts  # while you work
```

Commit `src/types/api.ts` with the change; a type error in the frontend is then the API drift it would otherwise ship.

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
- **Layered error handling** — a real `ErrorBoundary` (catches render crashes), a `RouteError` element for thrown route errors, a `NotFound` page for unmatched routes, and an `ErrorToast` popover (so showing an error never shifts the layout) fed by `useError().showError(unknown)`. Every surface uses one policy (`toDisplayMessage`): strings and `ApiError` messages from the backend are shown as-is, while any other error's details appear only in development, so internals never leak in production. The toast clears when the path changes and on each new form submission.
- **Performant global hooks** — `useViewportTracker` (shared scroll/resize store via `useSyncExternalStore`, lazily subscribed and `requestAnimationFrame`-coalesced; its snapshot changes only when the viewport does, while `useViewportMoves` also counts scrolling inside elements), `useElementRect` for measuring elements, `usePresence` to keep an element mounted until its exit transition ends, and `useWindowKeys` for page-wide shortcuts that yield to fields, dialogs, and menus.
- **Native platform UI** — `Modal` uses `<dialog>` (`showModal`, focus trapping, top layer, `::backdrop`); with `confirm` it runs its action as a form, shows a failure inline, and reports an action still running when closed. `Menu` (opened by `MenuButton` or `useMenu`) uses the Popover API for light dismiss and Escape, with CSS `@starting-style` transitions; it places itself on whichever side of its trigger has room, supports arrow-key/Home/End navigation, focuses its first item on open, returns focus to the trigger on close, and leaves the DOM once closed. `Button` covers buttons, in-app links (`to`), and full-page links (`href`), with `primary`/`secondary`/`danger`/`ghost` variants and a `pending` state.
- **Accessible defaults** — WCAG AA contrast for the palette, `prefers-reduced-motion` honored globally, labelled `Spinner`/`Toggle`/`Modal`, and `autocomplete` hints on auth forms.
- **CSS modules with tokens** — a raw palette plus semantic `--color-*` tokens, and scales for spacing, font sizes, radii, icon sizes, and durations, live as custom properties in `@/styles/tokens.css`; restyling the app means editing that file. Named breakpoints (`@media (--mobile)`) come from `@/styles/media.css` via Lightning CSS's custom media.
- **Typed API client** — `@/utilities/api` wraps `fetch` with `get`/`post`/`put`/`patch`/`del`, typed from the server's generated OpenAPI types (`@/types/api`): each call takes a literal route path, and its body, query, path `params`, and response are checked against that route. It sends `credentials: 'include'`, forwards a `signal` (`AbortSignal`), retries a GET that hit a network failure or a 502/504, throws an `ApiError` carrying the status and the backend's `errors` messages (network failures become `ApiError` with status `0`; aborts are rethrown untouched; an unreadable 5xx gets a friendly message), and calls `setUnauthorizedHandler`'s handler to clear the session on any 401. Derive types from responses with `ApiResponse<'get', '/api/users/me'>`, as `User` is.
- **Session authentication** — `AuthProvider`/`useAuth` bootstrap the session from `/api/users/me` (a 401 means logged out; any other failure is surfaced). Login, Register, Forgot Password, and Reset Password use React 19 `<form action>` + `useActionState`. Registration renders a Cloudflare Turnstile challenge (invisible unless Cloudflare asks for interaction, fresh after each failed attempt). Login and Register offer Google, Facebook, and Apple sign-in, and Login explains a failed provider sign-in it is sent back from. Unverified users see a banner to resend their verification link, and `/verify-email` confirms the emailed link. Settings renames the account, emails a password reset link, and deletes the account after the email is typed to confirm. `routes.tsx` guards routes: `/` swaps `Home`/`Dashboard`, guest-only routes (`/login`, `/register`, `/forgot-password`) redirect when signed in, protected routes (`/settings`) redirect to `/login` and then return to the full original location (path, query, and hash; same-origin only), and `/admin` shows only to admins. Guards are UX only — the backend session enforces access on every request.

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
- **Content Security Policy** — serve `index.html` with a CSP such as `default-src 'self'; script-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; img-src 'self' data:; style-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'` (the Cloudflare origin is for the Turnstile challenge), plus `X-Content-Type-Options: nosniff` and `Referrer-Policy: strict-origin-when-cross-origin`. The production build has no inline scripts, so no `unsafe-inline` is needed.
- **Secrets** — anything in `import.meta.env` is shipped to the browser. Never put secrets in `VITE_*` variables.

## AI agents

An [AGENTS.md](./AGENTS.md) is included so AI coding agents produce code that matches this project's conventions.
