# MedOS

MedOS is a mobile-first Progressive Web App for personal medication tracking.

It is a static React + TypeScript + Vite app designed for GitHub Pages. There is no backend, no account system, no cloud sync, and no analytics.

## What It Does

- Guides first-time users through a 3-step onboarding flow
- Lets users build a daily medication routine
- Shows a Today dashboard with progress, next-up context, and one-tap dose logging
- Includes a History calendar for reviewing and correcting past tracked days
- Lets users manage their routine with add, edit, delete, activate/pause, and reorder controls
- Stores all data locally in the browser
- Supports export/import backup as JSON
- Works as an installable PWA with offline shell support
- Includes multiple visual themes

## Product Notes

- Private by design
- No account required
- No cloud sync
- Stored locally on this device
- Your routine and logs stay in this browser unless you export them
- Backups are recommended because local browser data can be cleared
- This app is for personal tracking only and does not provide medical advice

## Tech Stack

- React 18
- TypeScript
- Vite
- Static hosting via GitHub Pages
- Local browser storage
- Service worker for app-shell caching

## Local Development

Install dependencies:

```bash
npm install
```

Start the local dev server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the built app locally:

```bash
npm run preview
```

## GitHub Pages Readiness

The app is configured for static deployment:

- `vite.config.ts` uses `base: './'`
- navigation uses hash-based screen changes
- `manifest.webmanifest` uses relative paths
- the service worker is registered from a relative path

That makes it suitable for GitHub Pages project sites without needing a server.

## Deploying To GitHub Pages

1. Build the app:

```bash
npm run build
```

2. Publish the contents of `dist/` to GitHub Pages.

3. If you use GitHub Actions, configure Pages to deploy the `dist/` artifact.

## PWA Notes

MedOS includes:

- `public/manifest.webmanifest`
- app icons for install/Home Screen
- Apple mobile web app meta tags
- a static service worker in `public/sw.js`
- safe-area-aware layout styling for iPhone Home Screen use

For best results before wider release, test these flows on a real iPhone:

- Add to Home Screen
- cold-open from the Home Screen icon
- offline launch after first load
- bottom safe-area / Dynamic Island spacing

## Data Shape

### Medication

- `id`
- `name`
- `dose`
- `timeOfDay`
- `notes`
- `active`
- `sortOrder`

### DailyLog

- `date`
- `medicationId`
- `completed`
- `completedAt`
- `note`

### Settings

- `onboardingComplete`
- `themePreference`
- `trackingStartDate`
- `lastBackupDate`

## Beta Checklist

Before handing this to a first tester, the main things worth checking are:

- onboarding flow from a fresh browser
- adding, editing, deleting, and reordering medications
- completing today’s routine
- backfilling a past day in History
- export backup and import backup
- installing to iPhone Home Screen
- light and dark theme readability on a real device

## Current Status

The app builds successfully with:

```bash
npm run build
```

It is in a good state for a private beta on GitHub Pages, especially for a first real-user pass with a known tester.
