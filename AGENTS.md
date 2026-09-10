# AGENTS.md

React 19 + TypeScript + Vite template with SCSS modules.

## Verification (must pass before work is done)

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test
```

Use `npm run format` to auto-fix formatting, then re-run the checks.

## Import order

Group imports into blocks separated by a blank line, alphabetized within each block:

1. **CSS** — `'scss/App.scss'`, `styles from 'scss/Foo.module.scss'`
2. **React** — `react`, `react-dom`, `react-router-dom`, external packages
3. **Context** — `context/*`
4. **Hooks** — `hooks/*`
5. **Components** — `components/*`
6. **Utilities** — `utilities/*`

```tsx
import 'scss/App.scss';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useError } from 'context/Error';

import { useViewportTracker } from 'hooks/useViewportTracker';

import Button from 'components/Button';

import { isValidEmail } from 'utilities/helpers';
```

## Styles

- New styles are CSS modules: `Foo.module.scss`, imported as `import styles from 'scss/Foo.module.scss'`, referenced via `styles.className`. Global element resets live in `scss/App.scss` only.
- Rules are top-level. Nest only for a genuine descendant, `&:` state, or `&.` modifier.
- Use tokens and mixins from `scss/Variables.scss` (`@use './Variables' as *;`). Do not hard-code a value that has a variable: colors, spacing, radii, z-indexes, durations. Reuse mixins (`responsive`, `cover`) instead of duplicating rules.

## Code style

- Write the smallest clear implementation. Prefer concise over verbose or cleverly dense.
- **No comments.** Convey intent through naming, not prose. Do not add comments to explain what code does, restate logic, or narrate changes. This is a hard rule, not a preference.
- Use TypeScript's `type` keyword, not `interface`.
- Never use `any`. Use a precise type, a generic, or `unknown` with narrowing.
- No unsafe casts. Never `as unknown as X`. A single proven `as` is a last resort.
- Never disable a lint rule inline. Fix the underlying issue.
- Don't name a variable used only once; inline it. Keep a name only when reused, memoized, or when it genuinely aids readability.
- Always `async`/`await`, never `.then()`/`.catch()`/`.finally()` chains (except tests). For a fetch in `useEffect`, define a named `async` function, call it, and guard state updates against unmount:

  ```tsx
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = (await get('/views/thing', { id })) as Thing;
        if (active) setThing(res);
      } catch (err) {
        if (active) setError(getErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [id]);
  ```

- Use modern ES6+: `const`/`let` (never `var`), arrow functions, template literals, destructuring, spread/rest, default params, `?.`, `??`, and array/object methods over manual loops where they read clearly.

## Dependencies

- Keep dependencies minimal. Prefer the standard library and existing repo code over a new package.
- Do not add a dependency without clear justification. When in doubt, ask first.

## Testing

- Vitest + `@testing-library/react`. Tests live in `src/tests/`, mirroring the source layout (`src/tests/components/Foo.test.tsx`), never beside the code they cover.
- Test behavior through the public API: query by role/text, assert what a user sees, drive interaction with `@testing-library/user-event`.
