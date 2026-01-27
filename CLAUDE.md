# CLAUDE.md — Interview Studio V2

You are Claude Code working in this repository.

---

## PRODUCT (V2)

Name: Interview Studio V2 — Session-Based Interview Prep

Core promise:
"Prepare for every job application with structured sessions. Track your progress. Share professional reports."

This is a **session-based tool** where users can:
1. Create interview prep sessions (guest or authenticated)
2. Get actionable assessments and 30-day plans
3. Save history and share reports (authenticated users)

---

## V2 MODES

### Simple Mode (Guest)
- No login required
- 3-step flow: Landing → Quick Form → Result
- Session stored locally (sessionStorage)
- Cannot save to history or share
- Free tier: status + blockers + teaser
- Paid tier: full 30-day plan (one-time €9.99)

### Advanced Mode (Authenticated)
- Login/register required
- Full flow with CV upload
- Sessions saved to account
- History page with all past sessions
- Shareable report links (public URLs)
- Same pricing: free preview, €9.99 for full plan

---

## ROUTES (V2)

```
/                    → Landing (choose mode)
/session/new         → Simple Mode wizard (3 steps)
/session/new/advanced → Advanced Mode wizard (with CV upload)
/session/:id         → Session result view
/session/:id/full    → Paid result view
/share/:shareId      → Public shareable report
/history             → Session history (auth required)
/pricing             → Pricing page
/login               → Login
/register            → Register
```

---

## QUESTIONNAIRE (3 QUESTIONS - SIMPLE MODE)

Q1. Target role (text)
Q2. Experience level with this role (select)
Q3. Main challenge right now (select)

---

## QUESTIONNAIRE (5 QUESTIONS - ADVANCED MODE)

Q1. Target role (text)
Q2. Last time worked in this role (select)
Q3. Urgency (select)
Q4. Recent work examples (textarea)
Q5. Main blocker (select)

---

## SCORING RULES (DETERMINISTIC)

RED:
- Last relevant work > 18 months
- OR career switch with no recent examples
- OR urgent job need + weak signals

YELLOW:
- Relevant experience exists but outdated or poorly framed

GREEN:
- Recent relevant experience
- Clear role match
- Main issue is CV or positioning

---

## KEYBOARD SHORTCUTS

- `?` → Open shortcuts/help modal
- `/` or `Cmd/Ctrl+K` → Open command palette
- `Esc` → Close any modal
- `n` → New session (when not in form)
- `h` → Go to history (if authenticated)

---

## PRICING

- Free tier: Status badge + 3 blockers + 1 teaser action
- Paid tier: €9.99 one-time per session
  - Full 30-day action plan
  - CV rewrite suggestions
  - Roles to avoid
  - Pivot suggestion (if applicable)

---

## TECH STACK

- Frontend: Angular 17 + Tailwind CSS
- Backend: Spring Boot 3 + H2/PostgreSQL
- Auth: JWT-based
- Payments: Stripe (stubbed for now)

---

## HARD CONSTRAINTS

- Guest sessions must work without any auth
- Auth only required for: history, sharing, saving
- All scoring is deterministic (no ML)
- Mobile-friendly responsive design
- Event tracking stubs in place for analytics
