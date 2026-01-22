# PRODUCT BRIEF: Interview Autopsy

## Executive Summary
A B2C SaaS product that provides brutally honest interview readiness analysis for mid-to-senior software engineers. We tell people what recruiters think but never say.

---

## ICP (Ideal Customer Profile)

### Primary Persona: "The Stuck Senior"
- **Demographics**: 28-38 years old, 5-10 years experience
- **Role**: Mid-level engineer wanting Senior/Staff roles
- **Income**: $100K-$150K (aspiring to $150K-$200K+)
- **Geography**: English-speaking markets (US, UK, EU tech hubs)

### Psychographics
- Frustrated by interview ghosting
- Suspects something is wrong but can't identify it
- Has asked friends for feedback, got useless validation
- Willing to pay for uncomfortable truths
- Values directness over politeness

### Trigger Events
1. Just got rejected from "sure thing" interview
2. 3+ months of job searching with no offers
3. About to interview at dream company
4. Recently laid off, needs to move fast

---

## Value Proposition

### Headline
**"If You Fail This Interview, It Will Be Because of These"**

### One-liner
We show engineers exactly why they're getting rejected — and how to fix it in 72 hours.

### The Problem We Solve
1. **Blind spots**: People don't know what they don't know about their profiles
2. **Fake feedback**: Friends/family give validation, not truth
3. **Wasted applications**: Applying to wrong-level roles wastes time
4. **No actionable path**: Generic career advice doesn't convert

### Why Us
- **Brutal honesty**: We say what recruiters think but never tell you
- **Specific, not generic**: Based on YOUR profile, not platitudes
- **Actionable**: 72-hour plan, not "work on your networking"
- **Emotionally resonant**: Addresses fear and uncertainty directly

---

## Monetization Model

### Pricing
| Plan | Price | Target |
|------|-------|--------|
| Free Preview | €0 | Lead generation |
| Interview Readiness Report | €14.99 (one-time) | Primary revenue |
| Active Interview Mode | €9.99/month | Power users |

### Why This Works
1. **Low barrier**: €14.99 is impulse-buy territory
2. **One-time option**: No subscription fatigue for most users
3. **Clear value**: "Get this before your interview" is obvious
4. **Upgrade path**: Monthly for active job seekers

### Revenue Projections (Conservative)
- 1,000 free users/month
- 5% conversion = 50 reports = €750/month
- 10% to monthly = 5 × €9.99 = €50/month
- **MRR Potential**: €800+ with zero marketing

---

## Core Screens

### 1. Interview Failure Autopsy (`/autopsy`)
**Purpose**: Show top 3 reasons they'll fail
**Hook**: Fear + curiosity
**Paywall**: After top 3, lock remaining issues

### 2. Recruiter Mirror View (`/analysis/recruiter-view`)
**Purpose**: Show how they're perceived
**Hook**: "This is what they see in 7.4 seconds"
**Paywall**: Lock detailed signals after preview

### 3. Confidence Delta (`/analysis/delta`)
**Purpose**: Expose over/underestimation
**Hook**: "The gap between what you think and what's true"
**Paywall**: Lock salary reality check

### 4. 72-Hour Action Plan (`/analysis/next-72h`)
**Purpose**: Make value immediate
**Hook**: "Do this before your interview"
**Paywall**: Lock advanced tactics

---

## Why This Converts

### Emotional Triggers
1. **Fear**: "You're failing and don't know why"
2. **Curiosity**: "See what recruiters really think"
3. **Hope**: "Fix it in 72 hours"
4. **Urgency**: "Before your next interview"

### Friction Reduction
1. Free preview shows value immediately
2. No signup required for initial analysis
3. One-time purchase option (no commitment fear)
4. Money-back guarantee removes risk

### Social Proof
1. Assessment counter (live)
2. Company logos (engineers at Google, etc.)
3. Testimonials with specific outcomes
4. Stats (73% callback increase, etc.)

---

## Technical Stack

### Frontend
- Angular 17 (standalone components)
- Tailwind CSS (dark-first UI)
- Signals for state management
- EN/ET bilingual support

### Backend (Stubbed)
- Analysis API (currently mock data)
- Payment processing (Stripe-ready)
- User accounts (optional)

### Future Integration Points
- Claude API for personalized analysis
- Real salary data APIs
- LinkedIn OAuth
- PDF export service

---

## What to Build Next (v1.1)

### High Impact
1. **LinkedIn import**: One-click profile analysis
2. **Real AI analysis**: Connect to Claude for personalized feedback
3. **Interview simulator**: Practice with AI interviewer
4. **Email capture**: Lead nurturing for non-buyers

### Medium Impact
5. **Salary negotiation module**: "Know your number"
6. **Company-specific prep**: Target company analysis
7. **Progress tracking**: Before/after comparisons

### Nice to Have
8. **Mobile app**: Interview prep on-the-go
9. **Chrome extension**: LinkedIn profile scorer
10. **Community**: Anonymous interview stories

---

## Competitive Differentiation

### What Exists (and why it sucks)
| Competitor | Problem |
|------------|---------|
| LinkedIn Premium | Generic, not actionable |
| Levels.fyi | Data only, no personalization |
| Pramp | Practice only, no diagnosis |
| Career coaches | Expensive ($200+/hour), slow |

### Our Position
**"The brutally honest friend you wish you had"**
- Cheaper than coaches
- More personal than data tools
- More honest than social platforms
- Faster than networking

---

## Launch Checklist

### Phase 1: Validate (Now)
- [x] Core screens built
- [x] Paywall logic implemented
- [x] Landing page with conversion copy
- [ ] Connect to basic analytics
- [ ] Deploy to production

### Phase 2: Monetize (Week 2)
- [ ] Stripe integration
- [ ] Payment flow complete
- [ ] Email delivery for reports
- [ ] Basic customer support

### Phase 3: Scale (Month 1)
- [ ] SEO content strategy
- [ ] Paid ads testing
- [ ] Referral program
- [ ] AI integration

---

## Success Metrics

### North Star
**Paid report conversions per week**

### Supporting Metrics
- Free analysis completion rate
- Time on autopsy page
- Paywall click-through rate
- Refund rate (<5% target)

---

## Final Note

This product works because it hits a nerve. The fear of interview failure is real, universal, and under-served. Most career tools are too polite. We're not.

**The uncomfortable truth sells.**
