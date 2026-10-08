# React Template

An opinionated starter for React frontends: **React 19 + TypeScript + Vite**, styled with **CSS modules** and design tokens, tested with **Vitest**, and linted/formatted out of the box. It ships with a small set of commonly used hooks, contexts, components, and app patterns so a new project starts with real building blocks instead of a blank page.

![CI](https://github.com/jaredgei/react-ts-vite/actions/workflows/ci.yml/badge.svg)

## Stack

- **React 19** with `react-router` v7 (data router, lazy routes)
- **TypeScript** in strict mode (`verbatimModuleSyntax`, `noUncheckedIndexedAccess`)
- **Vite** for dev/build, with an `@/`-relative import alias
- **CSS modules** with custom-property design tokens, compiled by **Lightning CSS** (nesting, `color-mix`, prefixing)
- **Vitest** + **@testing-library/react** for tests
- **ESLint** (flat config, type-aware) + **Prettier**

## Getting started

Requires Node 20.19+ or 22.12+.

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
  context/       React context providers
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
- **Layered error handling** — a real `ErrorBoundary` (catches render crashes), a `RouteError` element for thrown route errors, a `NotFound` page for unmatched routes, and an `Error` notification channel whose `showError(unknown)` normalizes any thrown value.
- **Performant global hooks** — `useViewportTracker` (shared scroll/resize store via `useSyncExternalStore`, lazily subscribed and `requestAnimationFrame`-coalesced), `useElementRect` for measuring elements, and `useKeyPressed` built on `useEffectEvent`.
- **Native platform UI** — `Modal` uses `<dialog>` (`showModal`, focus trapping, top layer, `::backdrop`), and `Suggestions`/`Dropdown`/`VerticalMenu` use the Popover API for light dismiss and Escape, with CSS `@starting-style` transitions.
- **CSS modules with tokens** — colors, spacing, fonts, radii, z-indexes, durations, and a `--blur` glass effect live as custom properties in `@/styles/tokens.css`.
- **Session authentication** — an `AuthProvider`/`useAuth` context backed by a small `fetch` wrapper in `@/utilities/api` (`get`/`post`, `credentials: 'include'`, an `ApiError` carrying the status, and a `setUnauthorizedHandler` that clears the session on any live 401). Login/Register use React 19 `<form action>` + `useActionState`. `routes.tsx` guards routes: `/` swaps `Home`/`Dashboard`, guest-only routes (`/login`, `/register`) redirect when signed in, and protected routes (`/settings`) redirect to `/login` with the attempted path in `state.from`. Guards are UX only — the backend session enforces access on every request.

## Testing

Tests live in `src/tests/`, mirroring the source layout, which keeps the source tree free of test files.

```bash
npm run test        # run once
npm run test:watch  # watch mode
```

## Continuous integration

`.github/workflows/ci.yml` runs on every push to `main` and on all pull requests. It installs from the lockfile with `npm ci`, then runs, in order:

```
typecheck → lint → format:check → test → build
```

## AI agents

An [AGENTS.md](./AGENTS.md) is included so AI coding agents produce code that matches this project's conventions.
