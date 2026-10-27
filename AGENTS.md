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

Fix every bug you find, including pre-existing ones unrelated to the task: wrong behavior, race conditions, flaky or wrong tests, and stale docs. Never dismiss a failure as flaky or pre-existing; find the root cause, fix it, and say so in your summary.

Deletion over addition. Boring over clever. Fewest files possible. Fix bugs at the root cause (the shared function), not per caller. Never cut validation, error handling, security, or accessibility to save code.

## Verification (must pass before work is done)

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run build
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
import ErrorProvider from '@/context/ErrorProvider';

import { useViewportTracker } from '@/hooks/useViewportTracker';

import Home from '@/pages/Home';

import Button from '@/components/Button';

import { cx } from '@/utilities/classes';
```

## Context

A context lives in two files so Fast Refresh keeps working: `@/context/Foo.ts` creates it with `createSafeContext` and exports the context, `useFoo` hook, and types; `@/context/FooProvider.tsx` default-exports only the provider component. Component files export only components (types are fine).

## Styles

- New styles are CSS modules: `Foo.module.css`, imported as `import styles from '@/styles/Foo.module.css'`, referenced via `styles.className`. Global element resets live in `@/styles/App.css` only.
- Rules are top-level. Nest only for a genuine descendant, `&:` state, or `&.` modifier (native CSS nesting).
- Use the custom properties from `@/styles/tokens.css` (`var(--color-primary)`, `var(--space-md)`, etc.). Components use the semantic `--color-*` tokens; the raw palette (`--purple`, `--gray`, …) is referenced only inside `tokens.css`, so restyling the app is a change to that one file. Do not hard-code a value that has a token: colors, spacing, font sizes, radii, icon sizes, durations. Add a semantic token rather than reaching for a raw color, and derive color variants with `color-mix`. Dialogs and popovers render in the top layer, so there are no z-index tokens; don't add z-indexes to stack them.
- Responsive: build layouts that adapt on their own first (flex/grid wrapping, `min()`, `clamp()`, `max-width`). Use a media query only when the layout must change, and only with the named breakpoints in `@/styles/media.css` (`@import './media.css';` then `@media (--mobile)`); never a literal width.
- `App.css` zeroes margins on headings, paragraphs, blockquotes, figures, and lists. Space siblings with `gap` on a flex/grid parent, not margins.
- Hover feedback sits in `@media (hover: hover)`, so a tap never leaves it stuck on; hover that reveals something stays ungated, so a tap can reveal it. Only a bare link in text gets the link look (`:where(a:not([class]))`); a link with a class is a component that sets its own color and weight. Focus rings come from the global `:focus-visible`; don't restate them.
- Every button is the `Button` component: `to` for in-app links, `href` for full-page links (such as OAuth), otherwise a `<button>`; `variant='ghost'` for icon-only buttons and `pending` while its action runs. A surface that is itself the hit target (a whole card, an image) may be a bare `<button>` or `Link`, which `App.css` already resets.
- Menus open from a `MenuButton` (a ⋮, or a `Button` of the given variant and content) or from `useMenu` spread on a trigger with its own face; both render `Menu`, placed with `popupPosition` from `@/utilities/popup`. An option without a name is a divider; one with `checked` is a radio choice, marked when current. Never build another popup positioner.
- Combine class names with `cx(...)` from `@/utilities/classes`, never string templates.
- Motion: animations change only `opacity` and `transform`/`translate` (short hover transitions may also tween colors). Animate a layout property only where a transform would distort the content, briefly and never per frame (a panel opening by transitioning `grid-template-rows` between `0fr` and `1fr`). Keep the number of simultaneously animating elements small (animate a group, not each child), and never animate indefinitely anything that stays on screen: browsers repaint for every frame of it, and re-blur every visible `backdrop-filter`.
- Floating layers and anything else shown then hidden (menus, toasts, tooltips) are in the DOM only while shown: `usePresence` keeps an element mounted until the transitions that hide it finish, then unmounts it. Panels that ease open and shut in place stay mounted.
- Keyframe names are global (`cssModules.animation: false` in `vite.config.ts`): a shared animation (`spin`) is defined once in `App.css`, and a module's own keyframes take a name no other module uses.
- Lightning CSS handles vendor prefixing and syntax lowering; write modern CSS (nesting, `color-mix`, `@starting-style`, `:focus-visible`).

## Platform first

Prefer native platform features over hand-rolled logic: `<dialog>` with `showModal()` for modals, the Popover API for menus/dropdowns, `<form action>` with `useActionState` for submissions, and `useSyncExternalStore` for external stores. Reach for these before adding effects, portals, or manual event wiring.

## Code style

- Write the smallest clear implementation. Prefer concise over verbose or cleverly dense.
- **No comments.** Convey intent through naming, not prose. Do not add comments to explain what code does, restate logic, or narrate changes. A single-line comment is allowed only for a genuinely non-obvious "why". This is a hard rule, not a preference.
- Components take content as `children`, not text props. Forward native attributes (e.g. `aria-label`) by spreading the element's `ComponentProps`.
- Use TypeScript's `type` keyword, not `interface` (except module augmentation, which requires `interface`).
- Export only what another module imports.
- `verbatimModuleSyntax` is on: import types with `import type` / inline `type`.
- Never use `any`. Use a precise type, a generic, or `unknown` with narrowing.
- No unsafe casts. Never `as unknown as X`. A single proven `as` is a last resort.
- Never disable a lint rule inline. Fix the underlying issue.
- Don't name a variable used only once; inline it. Keep a name only when reused, memoized, or when it genuinely aids readability.
- Always `async`/`await`, never `.then()`/`.catch()`/`.finally()` chains (except where a library or test requires a callback).
- Call the API through `get`/`post`/`patch`/`put`/`del` from `@/utilities/api` with the literal route path. Bodies, query parameters, path `params`, and responses are inferred from the generated `@/types/api`; derive response types with `ApiResponse`, never hand-write them, and never edit `@/types/api`. Regenerate it from the server (`npm run api:types -- <this repo>/src/types/api.ts` in the [express-ts-template](https://github.com/jaredgei/express-ts-template) backend) in the same change as the routes it describes.
- Page-wide shortcuts listen through `useWindowKeys`, which leaves a key to whatever already handled it, to an open dialog or menu, and, unless it is Escape, to the field being typed in. Never add a bare `window` key listener.
- Errors the user should see go through `useError().showError`, shown by the `ErrorToast` popover (no layout shift); a dialog shows its action's failure inline. A confirmation is a `Modal` with `confirm`: it runs the action, keeps the dialog open with the error if it fails, and waits for an action still running when closed, so its outcome is always reported.
- Use modern ES6+: `const`/`let` (never `var`), arrow functions, template literals, destructuring, spread/rest, default params, `?.`, `??`, and array/object methods over manual loops where they read clearly.

## Dependencies

- Keep dependencies minimal. Prefer the standard library and existing repo code over a new package.
- Do not add a dependency without clear justification. When in doubt, ask first.

## Testing

- Vitest + `@testing-library/react`. Tests live in `src/tests/`, mirroring the source layout (`src/tests/components/Foo.test.tsx`), never beside the code they cover.
- Test behavior through the public API: query by role/text, assert what a user sees, drive interaction with `@testing-library/user-event`.
- Vitest globals are off; import `describe`/`it`/`expect`/`vi` from `vitest`. jsdom stubs (`showModal`, `togglePopover`, `ResizeObserver`, `IntersectionObserver`, `matchMedia`, `scrollIntoView`) live in `src/tests/setup.ts`; `FakeResizeObserver.resize` from `@/tests/resizeObserver` reports a size.
- Mock the API with `vi.hoisted` `vi.fn`s typed loosely (`(path: string, body?: unknown) => Promise<unknown>`), since the typed `get`/`post` won't accept a fixture of the wrong shape.
- jsdom runs no transitions, so whatever waits for one moves on at once; `holdTransitions` from `@/tests/transitions` holds them until the test lets them finish.
