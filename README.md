# React Template

An opinionated starter for React frontends: **React 19 + TypeScript + Vite**, styled with **SCSS modules**, tested with **Vitest**, and linted/formatted out of the box. It ships with a small set of commonly used hooks, contexts, components, and app patterns so a new project starts with real building blocks instead of a blank page.

![CI](https://github.com/jaredgei/react-ts-vite/actions/workflows/ci.yml/badge.svg)

## Stack

- **React 19** with `react-router-dom` v7
- **TypeScript** in strict mode
- **Vite** for dev/build, with a `src/`-relative import alias
- **SCSS modules** with a shared token/mixin system, autoprefixed via PostCSS
- **Vitest** + **@testing-library/react** for tests
- **ESLint** (flat config) + **Prettier**

## Getting started

Requires Node 20+.

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:5173` and proxies `/api` to `http://localhost:8001` (configurable in `vite.config.ts`).

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
  components/    Reusable UI (Button, Modal, Dropdown, Toggle, Spinner, ...)
  context/       React context providers (Error)
  hooks/         Custom hooks (useViewportTracker, useElementRect)
  pages/         Routed pages (Home, NotFound)
  scss/          Global styles, tokens/mixins (Variables), and *.module.scss
  tests/         Vitest tests, mirroring the source layout
  utilities/     Helpers, icons, and createSafeContext
  App.tsx        Router setup
  main.tsx       App entry, wrapped in ErrorBoundary + ErrorProvider
```

Imports use a `src`-relative alias (defined by `paths` in `tsconfig.json` and honored by Vite), so modules are imported as `components/Button`, `hooks/useViewportTracker`, `scss/App.scss`, etc.

## What's included

- **Type-safe context** — `createSafeContext` builds a context plus a hook that throws a clear error when used outside its provider.
- **Layered error handling** — a real `ErrorBoundary` (catches render crashes), a `RouteError` element for thrown route errors, a `NotFound` page for unmatched routes, and an `Error` notification channel backed by context.
- **Viewport-aware hooks** — `useViewportTracker` (a single shared scroll/resize store via `useSyncExternalStore`) and `useElementRect` for measuring elements.
- **SCSS modules with tokens** — colors, spacing, fonts, radii, z-indexes, durations, and a `$blur` glass effect live in `scss/Variables.scss`, alongside `responsive` and `cover` mixins.

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
