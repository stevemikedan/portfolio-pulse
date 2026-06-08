# Portfolio Pulse — Spec

## Overview
Local-first portfolio health dashboard that scans git repos on your machine, reads structured project docs (prd.yaml, STATUS.md, PROJECT.md), and surfaces health scores, "trap" metrics, sprint planning, and Kanban views. Works with any git host (GitHub, Bitbucket, GitLab, self-hosted, or no remote at all). Optional API enrichment for PRs, issues, and CI status.

Consolidation of 4 existing HTML prototypes:
- portfolio-dashboard-v2.html — "Frictionless Development Trap" stats dashboard
- project-workspace.html — Sprint planner with comparison and drag-to-slot
- project-planner.html — Plans/Board/Timeline/Compare tabbed workspace
- portfolio-dashboard.html — Original simpler dashboard

## Tech Stack
- Vite + React + TypeScript
- Tailwind CSS (dark theme matching prototype CSS vars)
- Chart.js (already used in prototypes)
- js-yaml for prd.yaml parsing
- simple-git or child_process for local git operations
- Optional: Octokit (GitHub), bitbucket.js (Bitbucket), @gitbeaker (GitLab)

## Epic: Project Scanner
Walks a configurable root directory tree, finds git repos, extracts git stats, and discovers project doc files.

Features:
- Git repo discovery: walk dirs, find .git folders, read git remote URLs
- Git stats extraction: commit history, branch list, last commit date, contributor count, uncommitted changes
- Provider detection: parse remote URL to detect GitHub/Bitbucket/GitLab/unknown
- Plan file discovery: find plans/prd.yaml, plans/STATUS.md, plans/PROJECT.md, .rex/, .sourcevision/
- Scan caching: cache scan results, re-scan on demand or on file change

## Epic: Data Parsers
Parse discovered project files into a normalized data model.

Features:
- prd.yaml parser: load YAML, flatten epic/feature/task hierarchy into item list with statuses
- STATUS.md parser: extract overview, current state, next steps, decision log sections
- PROJECT.md parser: extract overview, goals, scope, target users, tech stack
- Rex PRD parser: read .rex/prd_tree/ or legacy .rex/prd.json and normalize to same model
- SourceVision reader: read .sourcevision/manifest.json and zones.json for architecture data

## Epic: Health Scoring
Compute per-project health scores from git + plan data.

Features:
- Completion ratio: done items / total items from PRD
- Recency score: days since last commit with decay function
- Velocity trend: commits per week over last 3 months, trending up or down
- Test signal: detect test files, parse test pass/fail from STATUS.md
- Doc completeness: has STATUS.md + PROJECT.md + prd.yaml?
- Composite health score: weighted combination of above signals (0-100)

## Epic: Trap Metrics
Portfolio-level metrics that surface the "Frictionless Development Trap" pattern.

Features:
- Proliferation rate: new repos created per month
- Attention budget: concurrent active projects vs sustainable limit
- Stall detection: projects with no commits in 7/30/90 days
- Completion funnel: created → in progress → active → shipped
- The Parabola: commit volume over time showing rise-and-collapse

## Epic: Dashboard View
Portfolio health overview with charts and stats. Consolidates portfolio-dashboard-v2.html.

Features:
- KPI stat cards: total projects, active, stalled, in-progress, creation rate
- Commit timeline chart: area chart of weekly commits over time
- Status breakdown: doughnut chart of project statuses
- Monthly volume: bar chart with confirmed/estimated markers
- Proliferation rate: new projects per month vs cumulative
- Project health list: sortable table with health scores, last activity, completion %
- Thesis banner: "Frictionless Development Trap" narrative callout

## Epic: Board View
Kanban board showing items from prd.yaml across all projects. Consolidates project-planner Board tab.

Features:
- Kanban columns: To Do, In Progress, Done (filterable by project)
- Card display: item title, project name, priority, epic context
- Filter by project: dropdown to scope board to one or all projects
- Group by: status, project, priority, epic
- Click-to-move: advance cards between columns

## Epic: Timeline View
Gantt-style timeline of project activity. Consolidates project-planner Timeline tab.

Features:
- Project rows: one row per project
- Activity bars: colored bars showing commit activity periods
- Today marker: red vertical line for current date
- Filter: active only, all, sprint only
- Zoom: weekly or monthly granularity

## Epic: Sprint View
Sprint planning workspace. Consolidates project-workspace.html.

Features:
- Sidebar project list: filterable cards with status badges and health scores
- Sprint slots: drag-to-add items from pending PRD tasks
- Sprint capacity: configurable slots per sprint
- Project comparison: 2-up or 3-up side-by-side detail panes
- Sprint summary: total items, estimated effort, project mix

## Epic: Plans View
Browse project documentation. Consolidates project-planner Plans tab.

Features:
- Sidebar: list of all projects with status indicators
- Content pane: rendered STATUS.md and PROJECT.md
- PRD tree: expandable epic/feature/task tree from prd.yaml
- Search: full-text search across all project docs

## Epic: API Enrichment (Optional)
Optional connections to GitHub/Bitbucket/GitLab for extra data.

Features:
- Provider config: settings UI to add API tokens per provider
- GitHub enrichment: open PRs, issues, CI status, contributors
- Bitbucket enrichment: open PRs, pipelines status
- GitLab enrichment: open MRs, pipeline status
- Enrichment badge: visual indicator when API data is available vs git-only
