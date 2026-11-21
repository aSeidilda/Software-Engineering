# Project memory

## Product intent & audience

- Personal Expense & Budget Tracker: a fully client-side web app for individuals to log expenses and monitor spending against a monthly budget.
- No backend, database, or API keys; all data persists in browser `localStorage`.
- First-visit experience seeds five mock sample expenses so the UI is never empty.

## Brand personality & voice

- Clean, functional, minimal — but polished and production-worthy, not generic.
- Utility-first tone; the app should feel straightforward and trustworthy for personal finance.

## Visual design & UX direction

- Tailwind CSS for styling; Lucide React for icons.
- Color-coded budget progress bar: amber when approaching the limit, red when exceeded.
- Layout prioritizes clarity: expense list, filter controls, budget input, and export actions are readily accessible.
- Categories exposed as a fixed enum: Food, Transport, Utilities, Entertainment, Other.
- Responsive and accessible interactions expected as the app evolves.

## Decisions, constraints & rationale

- Stack: React + TypeScript + Vite + Tailwind CSS.
- Persistence uses direct `localStorage.getItem` / `JSON.parse` — no wrapper utilities.
- Export formatting (CSV, JSON, Plain Text) implemented inline in the main component using standard `if/else` conditionals.
- Testing: Vitest included; unit tests live in `src/utils/calculations.test.ts` covering total-sum and budget-remaining calculations.
- `package.json` has working `npm run build` and `npm test` scripts.
- No ESLint or Prettier configs added yet.
- Imports use the `@/` path alias (maps to `src/`).

## Open questions & assumptions

- Single-currency assumption; no multi-currency or localization specified.
- Budget treated as a monthly limit; no automatic reset or historical month navigation yet.
- No authentication or multi-user support (single-user, local-only).
- Date handling assumes simple date input without timezone complexity.