# Estopia Open Source

An interactive, **command-line styled** website that showcases the open-source
projects built and maintained by [Estopia Engineering](https://estopia.net).

Visitors land in a fake terminal and can type commands to explore our work,
support us, or jump back to the main site. Prefer clicking? A one-tap toggle
switches the whole thing into a conventional landing page.

### Estopia commands

| Command          | What it does                             |
| ---------------- | ---------------------------------------- |
| `help`           | List every available command             |
| `about`          | Who Estopia Engineering is               |
| `projects`       | List our open-source projects            |
| `open <n\|name>` | Open a project on GitHub                 |
| `donate`         | Support us via GitHub Sponsors           |
| `site`           | Visit [estopia.net](https://estopia.net) |
| `github`         | Open our GitHub organisation             |
| `contact`        | How to reach us                          |
| `gui` / `exit`   | Switch to the normal website view        |

### System commands (it behaves like a real shell)

`ls` · `cd` · `pwd` · `cat` · `neofetch` · `uname` · `whoami` · `hostname` ·
`uptime` · `history` · `man <cmd>` · `which <cmd>` · `date` · `echo` · `clear`

There is a small virtual filesystem: `ls` shows `projects/` plus files like
`about.txt` and `donate.txt`, `cd projects` walks into the repo list, and the
prompt path updates as you move around.

Supports command history (↑/↓), Tab autocompletion, and `Ctrl+L` to clear.

## Window & views

The whole UI lives in a draggable "window":

- **Terminal ⇄ Simple view** — a toggle (and the `gui`/`exit` commands) flips
  between the CLI and a normal landing page with project cards. The choice is
  remembered in `localStorage`.
- **Draggable** — grab the title bar to move the window (mouse or touch).
- **macOS-style controls** — traffic-light close / minimise / maximise buttons.
- **Minimise / maximise** — the window controls and a double-click on the title
  bar actually work.

A **Donate** button and a **Main site** link are always visible in the title
bar for visitors who would rather click than type.

## Tech

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + React 19
- Tailwind CSS v4
- TypeScript

The project list is fetched live from the public repositories of the
[`Estopia`](https://github.com/Estopia) GitHub organisation
(`app/lib/projects.ts`), filtered to non-forked, non-archived repos. If GitHub
is unreachable it falls back to a curated static list, so the page always
renders.

### Live updates

The list refreshes **in real time** while the page is open — no reload needed.
The client polls the `GET /api/projects` route handler (`app/api/projects/`)
every 60 seconds (and immediately when the tab regains focus). When repos are
added, removed, renamed, or re-described on GitHub, the change appears in both
views and a `● live` indicator pulses in the status bar.

To stay safely under GitHub's unauthenticated API limit (60 requests/hour per
IP), the upstream call is cached server-side via the `fetch` data cache
(`REVALIDATE_SECONDS`, 60s) and **shared across every visitor** — so the number
of GitHub calls is independent of how many people are on the site. A transient
API error never downgrades a good list to the offline fallback.

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
pnpm dev      # start the dev server
pnpm build    # production build
pnpm start    # serve the production build
pnpm lint     # run ESLint
pnpm format   # format with Prettier
```

## Docker

The app ships with a multi-stage `Dockerfile` (built on Next.js' standalone
output) and a `docker-compose.yml`.

With Compose:

```bash
docker compose up --build    # build + run on http://localhost:3000
docker compose down          # stop and remove
```

Or with plain Docker:

```bash
docker build -t estopia-open .
docker run --rm -p 3000:3000 estopia-open
```

The runtime image is ~200 MB, runs as a non-root `nextjs` user, and the server
honours the `PORT` and `HOSTNAME` environment variables (defaults `3000` and
`0.0.0.0`).

## Configuration

Site-wide links (main site, donation URL, GitHub org, contact email) live in
[`app/lib/site.ts`](app/lib/site.ts). Curated project descriptions and the
offline fallback list live in [`app/lib/projects.ts`](app/lib/projects.ts).

## Structure

| File                | Responsibility                                                         |
| ------------------- | ---------------------------------------------------------------------- |
| `app/page.tsx`      | Server component — fetches projects, SEO/no-JS fallback                |
| `app/app-shell.tsx` | The window: OS controls, dragging, maximise, view toggle, live polling |
| `app/terminal.tsx`  | The interactive shell (commands + virtual filesystem)                  |
| `app/site-view.tsx` | The "normal" landing-page view                                         |
| `app/api/projects/` | `GET` route handler that serves the live project list                  |
| `app/lib/`          | Site config + project data                                             |
