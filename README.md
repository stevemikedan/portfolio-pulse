# Portfolio Pulse

A personal work-rhythm dashboard. Aggregates tasks and activity from GitHub, local git repos, Notion, and CSV imports — then surfaces a gap analysis and a daily activity chart so you can see where your time actually goes.

## Features

- **My Assignments** — unified task list from SQLite, GitHub issues, and CSV imports, with inline create/edit/delete
- **Activity Feed** — merged stream from GitHub events and local git commits
- **Gap Analysis** — flags tasks with no recent activity and unplanned work
- **Work Rhythm** — Chart.js stacked bar of daily activity with 7d/14d/30d toggle
- **Local Repo Picker** — add git repos for activity tracking directly in the UI, no config file editing needed

## Quick start

```bash
pnpm install
pnpm run seed          # seed SQLite with sample tasks
pnpm run dev           # http://localhost:3000
```

The SQLite database is created automatically at `prisma/dev.db` on first run.

## Configuration

Create a `.env.local` file at the project root. All variables are optional — the dashboard works with whatever sources you configure.

```env
# GitHub — enables the activity feed and issues panel
GITHUB_TOKEN=ghp_your_token_here
GITHUB_USERNAME=your-github-username

# Notion — enables task sync (connector coming soon)
NOTION_TOKEN=secret_your_token_here
NOTION_TASKS_DATABASE_ID=your-database-id

# Local git repos — comma-separated absolute paths (can also be set in the UI)
LOCAL_REPO_PATHS=/Users/you/dev/project-a,/Users/you/dev/project-b
```

### GitHub token

Generate one at **GitHub → Settings → Developer settings → Personal access tokens**. The `read:user` and `repo` scopes cover public activity; add `read:org` for org repo events.

### Local repos

Repo paths can be added and removed directly in the **Local Repos** panel on the dashboard — no `.env.local` editing required. Paths persist to `data/local-repos.json` (gitignored) and are merged with any `LOCAL_REPO_PATHS` env var entries at runtime.

## Scripts

```bash
pnpm run dev      # dev server with hot reload
pnpm run build    # production build
pnpm run start    # serve production build
pnpm test         # run all tests
pnpm run seed     # re-seed the database with sample tasks
```

## CSV import

Click **Import CSV** in the Assignments panel header. Expected columns:

| Column | Required | Notes |
|--------|----------|-------|
| `title` | yes | |
| `status` | no | `todo` / `in_progress` / `done` / `blocked` |
| `priority` | no | `high` / `medium` / `low` / `none` |
| `project` | no | |
| `dueDate` | no | ISO date `YYYY-MM-DD` |

## Tech stack

- **Next.js 16** (App Router) + **React 19**
- **Prisma 6 + SQLite** — local task storage
- **Chart.js / react-chartjs-2** — Work Rhythm visualization
- **Octokit** — GitHub API
- **@notionhq/client** — Notion API
- **Tailwind CSS v4**
- **Vitest + Testing Library** — unit and component tests
