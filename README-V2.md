# Interview Studio V2

Session-based interview prep tool. Prepare for every job application with structured sessions, track your progress, and share professional reports.

## Quick Start

### Backend
```bash
cd studio-backend
./gradlew bootRun
# Runs on http://localhost:8082
```

### Frontend
```bash
cd taskexposure-frontend
npm install
npm start
# Runs on http://localhost:4200
```

## What's New in V2

### Two Modes
1. **Quick Check (Simple Mode)** — 3 questions, no account required, instant results
2. **Deep Dive (Advanced Mode)** — 5 questions + CV analysis, requires account, saves to history

### Features
- **Session History** — View all past sessions (requires account)
- **Shareable Reports** — Public URLs for paid sessions
- **Keyboard Shortcuts** — Press `?` to see all shortcuts
- **Command Palette** — Press `/` or `Cmd+K` to quick-navigate

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `?` | Show shortcuts help |
| `/` or `Cmd+K` | Open command palette |
| `Esc` | Close any modal |
| `n` | New session |
| `h` | Go to history (if logged in) |
| `p` | Go to pricing |
| `g` | Go home |

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page — choose mode |
| `/session/new` | Simple mode wizard (3 steps) |
| `/session/new/advanced` | Advanced mode wizard (5 steps, auth required) |
| `/session/:id` | Session result view |
| `/share/:shareId` | Public shareable report |
| `/history` | Session history (auth required) |
| `/pricing` | Pricing page |
| `/login` | Login |
| `/register` | Register |

## API Endpoints

### Public (No Auth)
- `POST /api/studio/v2/sessions/simple` — Create simple session
- `GET /api/studio/v2/sessions/{id}` — Get session (free content)
- `GET /api/studio/v2/sessions/{id}/full` — Get full session (paid content)
- `GET /api/studio/v2/share/{shareId}` — Get shared session
- `POST /api/studio/v2/sessions/pay` — Mark session as paid

### Authenticated
- `POST /api/studio/v2/sessions/advanced` — Create advanced session
- `GET /api/studio/v2/sessions/history` — Get user's session history

## Monetization Flow

### Free Tier
Every session starts with a free preview:
- Red / Yellow / Green status badge
- Top 3 blockers identified
- First action teaser

### Paid Tier (€9.99 one-time per session)
After payment, unlock:
- Complete 30-day action plan (7 steps)
- CV rewrite suggestions
- Roles to target and avoid
- Pivot suggestion (if applicable)

### Payment Flow
1. User completes questionnaire → gets free result
2. User clicks "Unlock Full Plan" → payment processed
3. `POST /api/studio/v2/sessions/pay` marks session as paid
4. Page refreshes to show full content

**Note:** Payment is currently stubbed. In production, integrate Stripe:
1. Create PaymentIntent on backend
2. Confirm payment on frontend
3. Webhook verifies payment → marks session paid

## Scoring Rules (Deterministic)

### RED — High Risk
- Last relevant work > 18 months ago
- Career switch with no recent examples
- Urgent need + weak signals

### YELLOW — Needs Work
- Relevant experience exists but outdated
- CV/positioning needs optimization

### GREEN — Good Position
- Recent relevant experience
- Clear role match
- Main issue is presentation

## Database

New table: `interview_studio_session`
- Stores both simple and advanced sessions
- Supports anonymous (guest) and authenticated sessions
- Includes share ID for public reports
- Tracks payment status

## Architecture

```
taskexposure-frontend/
├── src/app/
│   ├── v2/                    # V2 components
│   │   ├── landing/           # Mode selection
│   │   ├── session-new/       # Simple mode wizard
│   │   ├── session-advanced/  # Advanced mode wizard
│   │   ├── session-view/      # Result display
│   │   ├── history/           # Session history
│   │   ├── pricing/           # Pricing page
│   │   ├── share/             # Public share view
│   │   └── auth/              # Login/register
│   ├── core/
│   │   ├── services/          # Auth, API, analytics, shortcuts
│   │   ├── guards/            # Auth guard
│   │   └── interceptors/      # HTTP interceptors
│   └── shared/
│       └── components/        # Shortcuts modal, command palette

studio-backend/
├── src/main/java/.../studio/
│   ├── api/                   # InterviewStudioController
│   ├── dto/                   # Request/response DTOs
│   ├── model/                 # InterviewStudioSession entity
│   ├── repository/            # JPA repository
│   └── service/               # Business logic + scoring
```

## Event Tracking

Analytics service provides stub implementations for:
- `page_view` — Track page visits
- `session_started` / `session_completed` — Track session flow
- `questionnaire_started` / `questionnaire_completed` — Track form completion
- `result_viewed` — Track result views
- `payment_initiated` / `payment_completed` — Track conversion
- `share_clicked` — Track sharing
- `login_started` / `login_completed` — Track auth
- `register_started` / `register_completed` — Track signups
- `command_palette_opened` — Track feature usage
- `shortcut_used` — Track shortcut usage

To enable, set `enabled: true` in `analytics.service.ts` and integrate with your analytics provider (Mixpanel, Amplitude, etc.).

## Demo Users

Default demo users (created by DemoDataSeeder):
- `demo@example.com` / `demo123`
- `test@example.com` / `test123`

## Development

### Skip Auth in Dev
Simple mode sessions work without any authentication. For testing advanced features, use the demo users above.

### Testing the Flow
1. Go to http://localhost:4200
2. Click "Quick Check" for simple mode
3. Complete 3 questions → see free result
4. Click "Unlock Full Plan" → see paid content (stub payment)

### Testing Advanced Mode
1. Click "Deep Dive" on landing page
2. Login with demo credentials
3. Complete 5 questions → see result
4. Check history at /history
5. Share link available for paid sessions
