---
name: design-consistent
description: Use for any Roovia mobile UI work — new screens, new components, or edits to existing ones. Enforces DESIGN.md's tokens (color, type, radius, shadow) so new work matches the rest of the app instead of drifting into one-off styling.
---

You build and edit UI for the Roovia mobile app (`mobile/`, Expo + React Native). Before writing or changing any screen or component, read `DESIGN.md` at the project root — it is the source of truth for color, typography, spacing and radius, not a suggestion.

## Rules

- **Never hardcode a color.** Pull every color from `useTheme().theme.colors.*` (see `mobile/src/constants/themes.ts`). If a needed color isn't a token yet, that's a sign to extend `themes.ts`, not to inline a hex value. The one narrow exception is a real external brand requirement (e.g. Apple's mandatory black "Sign in with Apple" button) — those are documented inline as an explicit exception, not a default.
- **Never hardcode a font family or size off DESIGN.md's scale.** Use `fonts.*` from `mobile/src/constants/fonts.ts` (`display`, `displayBlack`, `body`, `bodyMedium`, `bodySemiBold`, `bodyBold`, `editorial`, `editorialMedium`, `mono`, `monoBold`). Match DESIGN.md's Typography table for which role goes where (display face for hero numbers/headlines only, never body copy; mono for coordinates/budget/distance figures; editorial italic for journal/community voice).
- **Use the shared radius scale**, `radius.*` from `themes.ts` (`sm` inputs, `md` cards, `lg` sheets, `xl` modals, `pill` buttons/chips) — not ad-hoc `borderRadius` numbers.
- **Reuse existing primitives before writing new ones.** Check `mobile/src/components/ui/` (`Button`, `TextField`, `PasswordInput`, `Skeleton`, …) and `mobile/src/components/screens/` for an existing shell (e.g. `AuthLayout`) before building a new one. Extend or compose what's there; don't fork a parallel version of a button or input.
- **Map pins are their own namespace.** `mapPins.*` colors (from `themes.ts`) are for map markers only — never repurpose them for buttons, chips, or chrome.
- **Dark mode is not optional.** Every screen must read colors through `theme.colors`, which already resolves light/dark — never branch styling on `Platform` or hardcode a light-only palette. The one deliberate exception is onboarding (`src/app/onboarding/index.tsx`), which fixes its palette on purpose because its full-bleed photo backgrounds don't have a light/dark equivalent — read that file's own doc comment before treating it as a precedent for anything else.
- **Verify before reporting done.** After any change, run `bun run typecheck` and `bun run lint` from `mobile/` and confirm both are clean.

If a screen genuinely needs a color, type role, or radius DESIGN.md doesn't have, extend `DESIGN.md` and `themes.ts`/`fonts.ts` together in the same change — don't let the doc and the code drift apart.
