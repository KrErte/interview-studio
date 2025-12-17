# AI Risk Flow - Product 1 Implementation

## Overview

Complete implementation of a single-page, 4-step AI Risk Assessment flow for frontend engineers. This refactored version builds upon the existing dark Tailwind UI theme with green accent colors.

## Architecture

### Component Structure

```
src/app/pages/risk/
├── risk.component.ts           # Main orchestrator (4-step flow)
├── risk.component.html          # Main template
├── risk.component.scss          # Styles
└── components/
    ├── stepper-header.component.ts      # Progress indicator
    ├── stepper-header.component.scss
    ├── inline-qna.component.ts          # Question interface
    ├── inline-qna.component.scss
    ├── snapshot-card.component.ts       # Assessment display
    ├── snapshot-card.component.scss
    ├── roadmap-panel.component.ts       # Roadmap generator
    └── roadmap-panel.component.scss
```

### Services & Models

```
src/app/core/
├── models/
│   └── risk.models.ts           # Extended with Product 1 interfaces
└── services/
    └── risk-api.service.ts      # API client with mock implementations
```

## The 4-Step Flow

### Step 1: Inputs
- **CV Upload**: Reuses existing `CvUploadPanelComponent`
- **Work Experience**:
  - Years of experience (number, required)
  - Current role (text, required)
  - Seniority level (select: Junior/Mid/Senior/Lead)
  - Industry (text, optional)
  - Tech stack (textarea, comma-separated, optional)
- **Validation**: CV + years + role required
- **CTA**: "Calculate Risk" button

### Step 2: AI Clarifying Questions
- Exactly **3 questions total**
- Displays **ONE question at a time**
- Shows progress: "Question X of 3"
- **Actions**:
  - Submit answer (textarea, required)
  - Skip (allowed, but shows warning)
- **Confidence Impact**: Each skip reduces confidence by 8%
- **Auto-advance**: After question 3, automatically moves to Step 3

### Step 3: First Assessment
Displays comprehensive risk analysis:
- **Risk Percentage**: 0-100% with visual gauge
- **Risk Band**: LOW/MEDIUM/HIGH with color coding
- **Confidence Bar**: % based on completion and skipped questions
- **Top 3 Weaknesses**: Title, description, severity (high/medium/low)
- **Risk Signals**: Score, confidence, level for each signal
- **CTA**: "Generate Roadmap to Improve"

### Step 4: Roadmap
- **Duration Selector**: 7 / 30 / 90 days (tabs)
- **Display Format**:
  - **7 days**: Daily breakdown (Day 1, Day 2, etc.)
  - **30 days**: Weekly blocks (Week 1-4)
  - **90 days**: Monthly phases (Weeks 1-4, 5-8, 9-12, 13+)
- **Content**:
  - Summary text
  - Tasks list for each period
  - Interactive checkpoints (checklist style)
  - Progress indicators
- **Actions**:
  - Switch duration (regenerates)
  - Export roadmap (UI only, not implemented)
  - Restart flow

## Technical Implementation

### State Management
- Component-level state (no NgRx/Akita)
- Reactive patterns with RxJS
- Proper cleanup with `takeUntil(destroy$)`

### API Integration
- **Mock Mode**: `USE_MOCKS = true` in `risk-api.service.ts`
- **Fallback Strategy**: All API calls fall back to mocks on error
- **Realistic Data**: Mock responses mimic production payloads

### Mock Endpoints
```typescript
POST /risk/assessment/start           → StartAssessmentResponse
POST /risk/assessment/next-question   → GetNextQuestionResponse
POST /risk/assessment/submit-answer   → SubmitAnswerResponse
POST /risk/assessment/skip-question   → SubmitAnswerResponse
GET  /risk/assessment/:sessionId      → AssessmentResult
POST /risk/assessment/roadmap         → RoadmapResponse
```

To switch to real API: Set `USE_MOCKS = false` in `risk-api.service.ts`

### UX Features
- **Loading States**: Spinners for all async operations
- **Disabled Buttons**: During submissions/loading
- **Error Handling**: Non-blocking banner with retry option
- **Restart Flow**: Reset to Step 1 at any time
- **Visual Consistency**: Dark theme, emerald accent, card-based layout
- **Responsive**: Works on mobile and desktop

### Styling
- **Tailwind CSS**: Utility-first approach
- **Color Scheme**:
  - Primary: `emerald-400/500` (green)
  - Background: `slate-950/900/800`
  - Text: `slate-50/100/200/300`
  - Error: `rose-400/500`
  - Warning: `amber-400/500`
- **SCSS Files**: Minimal, mostly placeholders for future enhancements

## Running the Application

### Prerequisites
```bash
Node.js 18+ and npm
```

### Installation
```bash
cd frontend-risk
npm install
```

### Development Server
```bash
npm start
# Opens on http://localhost:4203
```

The proxy config (`proxy.conf.json`) routes `/api` calls to the backend.

### Access the Risk Flow
Navigate to: **http://localhost:4203/risk**

### Build for Production
```bash
npm run build
# Output: dist/frontend-risk/
```

## File Checklist

All files have been created/updated with FULL contents:

**Models & Services:**
- ✅ `src/app/core/models/risk.models.ts` - Extended interfaces
- ✅ `src/app/core/services/risk-api.service.ts` - API + Mocks

**Components:**
- ✅ `src/app/pages/risk/risk.component.ts` - Main orchestrator
- ✅ `src/app/pages/risk/risk.component.html` - Complete template
- ✅ `src/app/pages/risk/risk.component.scss` - Styles
- ✅ `src/app/pages/risk/components/stepper-header.component.ts`
- ✅ `src/app/pages/risk/components/stepper-header.component.scss`
- ✅ `src/app/pages/risk/components/inline-qna.component.ts`
- ✅ `src/app/pages/risk/components/inline-qna.component.scss`
- ✅ `src/app/pages/risk/components/snapshot-card.component.ts`
- ✅ `src/app/pages/risk/components/snapshot-card.component.scss`
- ✅ `src/app/pages/risk/components/roadmap-panel.component.ts`
- ✅ `src/app/pages/risk/components/roadmap-panel.component.scss`

**Reused Components:**
- ✅ `src/app/shared/cv-upload/cv-upload-panel.component.*` - Existing

## Testing the Flow

### Step 1 Test
1. Navigate to `/risk`
2. Upload a CV (or use existing profile)
3. Fill:
   - Years: `5`
   - Role: `Senior Frontend Engineer`
   - Seniority: `Senior`
   - Industry: `FinTech`
   - Stack: `Angular, TypeScript, RxJS, Tailwind`
4. Click "Calculate Risk"
5. Should advance to Step 2

### Step 2 Test
1. Answer all 3 questions OR
2. Test skip (should show warning first, then allow)
3. Should auto-advance after question 3

### Step 3 Test
1. View risk assessment
2. Check:
   - Risk % and band color
   - Confidence bar reflects skips
   - Top 3 weaknesses displayed
   - Risk signals with scores
3. Click "Generate Roadmap to Improve"

### Step 4 Test
1. Default: 7 days (daily view)
2. Switch to 30 days (weekly view)
3. Switch to 90 days (monthly phases)
4. Check/uncheck checkpoints
5. Click "Start New Assessment" → resets to Step 1

## Mock Data Behavior

### Confidence Calculation
- Base: 85%
- Each skipped question: -8%
- Minimum: 60%

### Risk Calculation
- Base: 35%
- Each skipped question: +5%
- Random variation: +0-10%
- Bands: <30% LOW, 30-60% MEDIUM, >60% HIGH

### Questions
Always the same 3 questions:
1. Technical challenge and approach
2. Learning strategies
3. Team collaboration experience

### Roadmap Content
Realistic, detailed plans for each duration with checkpoints.

## Customization

### Change Mock to Real API
```typescript
// In risk-api.service.ts
const USE_MOCKS = false; // Set to false
```

### Adjust Colors
Search and replace in templates:
- `emerald-*` → your primary color
- `slate-*` → your background/text colors

### Modify Questions
Update mock data in `mockGetNextQuestion()` method.

### Add More Weaknesses
Update mock data in `mockGetAssessment()` method.

## Architecture Decisions

1. **No state management library**: Component state sufficient for single-page flow
2. **Mock-first API**: Allows frontend development without backend dependency
3. **Subcomponents**: Improves maintainability and reusability
4. **Standalone components**: Modern Angular 19 pattern
5. **Tailwind inline**: Faster development, easier customization

## Next Steps for Production

1. **Backend Integration**: Implement real API endpoints
2. **Authentication**: Add auth guards (already in place at route level)
3. **Analytics**: Track completion rates, skip patterns
4. **Export**: Implement PDF/JSON export for roadmaps
5. **Persistence**: Save progress in localStorage or backend
6. **A/B Testing**: Experiment with question types, wording
7. **Validation**: Server-side validation for all inputs

## Support

For questions or issues:
- Check browser console for errors
- Verify all dependencies installed: `npm install`
- Ensure port 4203 is available
- Check proxy.conf.json for API routing

---

**Version**: 1.0.0
**Last Updated**: 2025-12-17
**Angular**: 19.2.0
**Tailwind CSS**: 3.4.17
