# 🎬 My-Favourite

A movie & TV show catalog built on the **TMDB API** with a crowd-sourced popularity rating: users sign in with Google, add titles to their favorites, and the home page shows everything anyone has ever favorited, sorted by how many times it's been added.

**🔗 Live demo:** [Favorite5](https://my-favorites-khaki.vercel.app/)

## Features

- 🔐 Google sign-in (Supabase Auth)
- ❤️ Add movies/shows to favorites — shared across all users
- 📊 Crowd rating: sorted by how many users favorited a title
- 🔍 Search movies and TV shows (debounced)
- 🎛️ Filters by media type, genre, and release year
- 🌍 UI and TMDB data switch between Ukrainian and English
- 📄 Two browsing modes: the shared favorites catalog and the full TMDB catalog with pagination
- 🎟️ Official paid watch-provider links (TMDB watch providers)
- 🆓 Free legal viewing options where available — or a prompt inviting users to share a link in the comments
- 💬 Comments under every movie/show
- 🤖 Telegram Mini App with automatic sign-in (no Google login needed inside Telegram)
- 📱 Responsive design: on mobile, movies swipe one-per-screen and genre/year filters scroll as chips
- 🖼️ Detailed movie info in a modal (overview, rating, runtime)

## Tech stack

- **React 19** + **TypeScript**
- **Vite** — build tool and dev server
- **Supabase** — authentication and data storage (PostgreSQL): favorites, comments
- **TMDB API** — movie/TV data and watch providers
- **SCSS Modules** — styles built on design tokens (`src/styles/_variables.scss`, `src/styles/mixin.scss`)
- **ESLint** + **Prettier** + **Husky/lint-staged** — code quality
- Deployed to **GitHub Pages** via `gh-pages`

## Getting started

### Requirements

- Node.js 18+
- A [Supabase](https://supabase.com) project (`favorites` and `comments` tables, Google OAuth provider enabled)
- A [TMDB](https://www.themoviedb.org/settings/api) API token

### Install

```bash
git clone https://github.com/i1yaremechko/my-favorites.git
cd my-favorites
npm install
```

### Environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_TMDB_ACCESS_TOKEN=your_tmdb_api_read_access_token
```

### Run in dev mode

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Scripts

| Command                | Description                                    |
| ----------------------- | ----------------------------------------------- |
| `npm run dev`           | Start the dev server with HMR                   |
| `npm run build`         | Type-check + production build into `dist/`      |
| `npm run preview`       | Preview the production build locally            |
| `npm run lint`          | Run ESLint (0 warnings tolerated)               |
| `npm run lint:fix`      | Auto-fix ESLint issues                          |
| `npm run format`        | Format code with Prettier                       |
| `npm run format:check`  | Check formatting without making changes         |
| `npm run deploy`        | Build and publish to GitHub Pages               |

## Project structure

```
src/
├── components/     # Reusable UI components (Header, Filters, MovieCard, Modal, Comments, WatchProviders...)
├── pages/          # Pages (Home, Favorites)
├── services/       # TMDB API and Supabase integrations
├── context/        # React Context (UI language)
├── hooks/          # Custom hooks (useLanguage)
├── i18n/           # UA/EN translation dictionary
├── types/          # TypeScript types
├── utils/          # Helper functions (movie localization)
└── styles/         # Design tokens and SCSS mixins
```

## Telegram Mini App

The same site can be opened both in a browser (desktop/mobile) and as a Telegram Mini App — no separate code or hosting required. Sign-in inside the Mini App happens automatically (via Telegram, no Google login) thanks to an Edge Function that verifies the `initData` signature server-side.

### 1. Create a bot

In [@BotFather](https://t.me/BotFather): `/newbot` → you'll receive a **bot token**.

### 2. Deploy the Edge Function

```bash
supabase login
supabase link --project-ref your-project-ref
supabase secrets set TELEGRAM_BOT_TOKEN=xxxxxxxxx:yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
supabase functions deploy telegram-auth
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are injected into the Edge Function automatically by Supabase — no need to set them manually.

### 3. Register the Mini App with @BotFather

`/newapp` → select your bot → provide the URL of your deployed site (e.g. `https://i1yaremechko.github.io/my-favorites`). HTTPS is required — GitHub Pages already provides it.

### 4. Verify

Open the bot in Telegram and tap the menu button — the app opens inside Telegram and signs in automatically, with no action required from the user.

> **Note:** Telegram users get a separate Supabase account (with a synthetic email like `tg-<id>@telegram.my-favorite.app`), not linked to that same person's Google account on the web version. This is a deliberate trade-off in the current implementation — account linking can be added later as a separate step if needed.

## Deployment

The project is set up to deploy via GitHub Pages:

```bash
npm run deploy
```

This builds the project (`predeploy`) and publishes the contents of `dist/` to the `gh-pages` branch.