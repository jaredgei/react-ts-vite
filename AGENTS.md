# AGENTS.md

The best code is the code never written. Optimize for the smallest change that fully solves the problem, and read the code a change touches before writing anything.

## Before writing code

Stop at the first rung that holds:

1. Does this need to exist? If not, don't build it.
2. Does it already exist in this repo? Reuse it; don't re-implement.
3. Does the standard library or a native platform feature cover it? Use it.
4. Does an already-installed dependency solve it? Use it.
5. Can it be one line? Make it one line.
6. Only then write the minimum that works.

Deletion over addition. Boring over clever. Fewest files possible. Fix bugs at the root cause (the shared function), not per caller. Never cut validation, error handling, security, or accessibility to save code.

## Verification (must pass before work is done)

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test
```

Use `npm run format` to auto-fix formatting, then re-run the checks.

## Import order

Imports use the `@/` alias (configured by `paths` in `tsconfig.json`). Group imports into blocks separated by a blank line, alphabetized within each block:

1. **CSS** — `'@/styles/App.css'`, `styles from '@/styles/Foo.module.css'`
2. **React** — `react`, `react-dom`, `react-router`, external packages
3. **Context** — `@/context/*`
4. **Hooks** — `@/hooks/*`
5. **Pages** — `@/pages/*`
6. **Components** — `@/components/*`
7. **Utilities** — `@/utilities/*`
8. **Other** — anything else under `@/`

```tsx
import '@/styles/App.css';
import { useActionState } from 'react';
import { useNavigate } from 'react-router';

import { useError } from '@/context/Error';

import { useViewportTracker } from '@/hooks/useViewportTracker';

import Home from '@/pages/Home';

import Button from '@/components/Button';

import { isValidEmail } from '@/utilities/validation';
```

## Styles

- New styles are CSS modules: `Foo.module.css`, imported as `import styles from '@/styles/Foo.module.css'`, referenced via `styles.className`. Global element resets live in `@/styles/App.css` only.
- Rules are top-level. Nest only for a genuine descendant, `&:` state, or `&.` modifier (native CSS nesting).
- Use the custom properties from `@/styles/tokens.css` (`var(--purple)`, `var(--medium-spacing)`, etc.). Do not hard-code a value that has a token: colors, spacing, radii, z-indexes, durations. Derive color variants with `color-mix`. Media-query breakpoints use literal lengths (custom properties can't be read inside a media condition).
- Lightning CSS handles vendor prefixing and syntax lowering; write modern CSS (nesting, `color-mix`, `@starting-style`, `:focus-visible`).

## Platform first

Prefer native platform features over hand-rolled logic: `<dialog>` with `showModal()` for modals, the Popover API for menus/dropdowns, `<form action>` with `useActionState` for submissions, and `useSyncExternalStore` for external stores. Reach for these before adding effects, portals, or manual event wiring.

## Code style

- Write the smallest clear implementation. Prefer concise over verbose or cleverly dense.
- **No comments.** Convey intent through naming, not prose. Do not add comments to explain what code does, restate logic, or narrate changes. This is a hard rule, not a preference.
- Use TypeScript's `type` keyword, not `interface`.
- `verbatimModuleSyntax` is on: import types with `import type` / inline `type`.
- Never use `any`. Use a precise type, a generic, or `unknown` with narrowing.
- No unsafe casts. Never `as unknown as X`. A single proven `as` is a last resort.
- Never disable a lint rule inline. Fix the underlying issue.
- Don't name a variable used only once; inline it. Keep a name only when reused, memoized, or when it genuinely aids readability.
- Always `async`/`await`, never `.then()`/`.catch()`/`.finally()` chains (except tests).
- Use modern ES6+: `const`/`let` (never `var`), arrow functions, template literals, destructuring, spread/rest, default params, `?.`, `??`, and array/object methods over manual loops where they read clearly.

## Dependencies

- Keep dependencies minimal. Prefer the standard library and existing repo code over a new package.
- Do not add a dependency without clear justification. When in doubt, ask first.

## Testing

- Vitest + `@testing-library/react`. Tests live in `src/tests/`, mirroring the source layout (`src/tests/components/Foo.test.tsx`), never beside the code they cover.
- Test behavior through the public API: query by role/text, assert what a user sees, drive interaction with `@testing-library/user-event`.
- Vitest globals are off; import `describe`/`it`/`expect`/`vi` from `vitest`. jsdom stubs for `showModal`/`togglePopover`/`ResizeObserver` live in `src/tests/setup.ts`.
