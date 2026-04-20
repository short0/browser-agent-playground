
# Browser Task Playground — Plan

A calm, minimalist single-page web app that teaches how agentic browsers work through visual, mocked task runs. Light mode default, dark toggle, fully responsive, no auth.

## Routes
- `/` — Home (hero, presets, "How it works", CTA)
- `/playground` — 3-panel sandbox (stacks on mobile)
- `/about` — What browser agents are + glossary (planning, acting, extracting, verifying)

Shared header with logo, nav, theme toggle.

## Home Screen
- **Hero**: One-line explanation ("Watch a browser agent plan, click, read, and verify — step by step"), primary CTA "Open Playground", secondary "Try a preset".
- **Preset cards** (4): Research, Compare prices, Extract data, Multi-step form. Each card shows goal + estimated steps; click → launches in playground.
- **How it works strip**: 5 labeled chips — Goal → Plan → Act → Extract → Verify — each with one-line explanation.
- **Footer**: link to About, GitHub-style minimal.

## Playground Screen (3 panels)

**Left panel — Control**
- Preset selector (dropdown + recent goals)
- Goal input (textarea)
- Mode toggle: **Mocked** (default, badge) vs **Live LLM** (advanced, requires API key in settings)
- Settings collapsible: speed (slow/normal/instant), auto-advance, show reasoning
- Run / Pause / Step / Replay buttons
- Undo / Redo / Reset buttons (top of panel, icon buttons with tooltips)

**Center panel — Run view**
- **Action timeline** (vertical): each step is a card with type label (PLAN, ACTION, OBSERVATION, EXTRACTION, VERIFY), timestamp, summary, and "Explain this step" link. Active step highlighted.
- **Page state simulation**: faux browser frame showing URL bar + simplified page content for the current step (rendered from mocked HTML snippets).
- **Extracted data view**: table/JSON toggle below page sim showing structured data harvested so far.

**Right panel — Outcome**
- **Task status**: pill (Idle / Planning / Running / Verified / Failed) + progress bar
- **Final answer card**: the agent's response to the goal
- **Reasoning summary**: bullet recap of why steps were chosen
- **Verification panel**: pass/fail checks (e.g., "All 3 sources cited", "Prices from ≥2 sites")
- **Run history**: list of past runs for this goal — click to compare side-by-side

**Responsive behavior**
- Desktop ≥1280px: 3 columns (280 / 1fr / 360)
- Tablet 768–1279px: left collapses to a drawer, center + right stacked or tabbed
- Mobile <768px: vertical stack — sticky top bar with Goal, Mode, Run/Reset; sections become tabs (Plan • Run • Result)

## Presets (mocked content)
Each preset ships with: goal text, 6–10 step plan, mocked browser actions (navigate, click, type, scroll, extract), faux page snapshots, extracted results, verification checks, final answer, and 3–5 example follow-up prompts.

1. **Research** — "Summarize how transformer attention works from 3 sources"
2. **Compare prices** — "Compare price of [product] across 3 stores"
3. **Extract data** — "Pull all job listings from this careers page into a table"
4. **Multi-step form** — "Book a demo: fill form with checkpoints, pause for approval before submit"

## Learning Features
- Inline color-coded labels: Goal (neutral), Plan (blue), Action (amber), Observation (gray), Extraction (green), Verify (purple) — consistent across app
- "Explain this step" opens a side popover with a 2–3 sentence beginner explanation tied to the step type
- Replay button re-runs the same mocked sequence; compare view shows two runs side-by-side with diffs
- About page has a glossary

## Live LLM Mode (secondary)
- Toggle in left panel; requires user to paste an API key (stored in localStorage, with clear warning)
- Uses mocked page content as "browser context" fed to the LLM for planning + extraction; actions remain simulated
- Banner across top when active: "Live mode — using your API key"
- Mocked mode remains the polished default; live mode is intentionally minimal

## State & Persistence (localStorage)
- `theme`, `mode` (mocked/live), `apiKey` (live only), `selectedPreset`, `currentGoal`, `playgroundState` (steps, current index, extracted data), `runHistory[]`, `recentGoals[]`, `notes`, `settings`
- **Undo/Redo**: history stack of major actions (preset change, goal edit, settings change, replay, clear). Cmd/Ctrl+Z and Cmd/Ctrl+Shift+Z bindings.
- **Reset to home**: clears current session state but preserves theme, presets, history.

## Design System
- Light: white bg, near-black text, subtle gray borders (oklch ~0.92), soft shadows, 1 calm accent (muted indigo) for active/CTA
- Dark: deep slate bg, off-white text, same accent at adjusted lightness
- Typography: Inter, generous line-height, clear hierarchy (no decorative fonts)
- Spacious padding, rounded-lg corners, no gradients
- Step type labels use small uppercase badges with low-saturation tints
- Motion: 150–200ms ease transitions only; no flashy animations

## Accessibility
- Full keyboard nav (Tab through panels, arrow keys in timeline, Enter to expand step)
- Visible focus rings using accent color
- ARIA labels on icon buttons, live regions for status changes
- Min 44px tap targets on mobile
- Contrast verified for both themes

## Tech
- TanStack Start routes: `/`, `/playground`, `/about`
- shadcn/ui primitives (Button, Card, Tabs, Sheet for mobile drawer, Tooltip, Badge, Popover, ScrollArea, Toggle)
- Zustand or React context + reducer for playground state with undo/redo middleware
- All mocked preset data lives in `src/data/presets.ts`
- Theme via class on `<html>`, persisted to localStorage, system preference fallback
