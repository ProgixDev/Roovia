# Monorepo Template

- [`mobile/`](./mobile) — Expo/React Native app
- [`server/`](./server) — NestJS backend (MongoDB or Supabase variant)
- [`web/`](./web) — Next.js app


## First-time setup, in order

Run these once, right after cloning:

1. `cd` into `mobile`, `server`, or `web` (any one — same effect either way).
2. `bun scripts/rename-project.ts` — renames project to your repo folder name.
3. `bun scripts/clean-keep.ts` — removes `.keep` placeholders. Self-deleting.
4. `bun scripts/reset-git.ts` — wipes git history, fresh initial commit. Self-deleting, run **last**.

Everything else (installing deps, updating deps, server database variant, git hooks, icons/keystores) is optional — see below.

## Root dispatcher scripts


```bash
bun run dev      # this is to start the mobile dev server
bun run mobile   # this is to run app in the emulator/ur phone
bun run rebuild  # this is to rebuild the Android native project from scratch
bun run apk      # this is to build a release .apk
bun run aab      # this is to build a release .aab (Play Store)
bun run server   # this is to run the server
bun run web      # this is to run the web
```

## General scripts

Each project has its own copy under `<project>/scripts/`, same behavior regardless of which one you run — covers the 3 setup scripts above, plus:

- `update-dependencies.ts` — updates deps (installs automatically).
- `setup-git-hooks.ts` — installs Husky so `git commit` lints (and format-checks, where set up) every project.

## Project-specific scripts

**`mobile/`**:
- `setup-nativewind.ts` — installs and configures NativeWind (Tailwind for React Native).
- `setup-android-keystores.ts` — generates debug/release Android signing keystores. Safe to re-run.
- `generate-adaptive-icon.ts` — builds `assets/images/adaptive-icon.png` from `Logo.png`.

**`server/`**:
- `setup-mongodb.ts` / `setup-supabase.ts` — picks the database/auth variant (MongoDB or Supabase). Run one before `bun install` in `server/`.

**`web/`**:
- `generate-favicon.ts` — builds `icon.png`, `apple-icon.png`, `opengraph-image.png` from `public/Logo.png`.
