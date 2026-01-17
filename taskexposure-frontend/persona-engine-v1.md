TaskExposure
Persona Engine v1 + Narrative UX Specification
Version 1.0 — December 2025
A task-level AI exposure assessment that treats users as evolving professionals, not statistics.

1. Strategic Positioning
The Problem with Legacy Tools
Every AI displacement calculator follows the same pattern: enter job title, receive fear-inducing percentage. These tools treat work as static categories and workers as interchangeable units. They answer "how screwed is your job?" when users actually need to know "what should I do differently tomorrow?"
TaskExposure inverts this entirely. We don't assess job titles. We assess actual work—the tasks, decisions, and judgment calls that make up someone's professional reality.
Core Differentiation
Dimension	Legacy Tools	TaskExposure
Input	Job title	User-described tasks
Methodology	Static risk lookup	Signal extraction + AI analysis
Output	Percentage + fear	Score + breakdown + roadmap
Emotional frame	Anxiety-inducing	Agency-affirming
What We Promise
"We don't tell you what AI will do to your career. We show you what you can do about it—starting with the work you already do."

2. Persona Engine v1 Specification
The Persona Engine transforms raw task descriptions into a structured signal profile. These signals determine not just an exposure score, but a user's perceived future role—their likely position in a human+AI workforce.
2.1 Signal Taxonomy
Every task description is analyzed for the following signals. Each signal exists on a spectrum, not as binary present/absent.

Signal	What It Measures	Exposure Impact
Routine Density	How much work follows predictable, repeatable patterns	High routine = High exposure
Decision Ambiguity	How often decisions require interpretation, not rules	High ambiguity = Low exposure
Trust Dependency	How much work requires human trust and relationships	High trust = Low exposure
Novel Context Frequency	How often situations are genuinely new vs variations	High novelty = Low exposure
Accountability Weight	How much personal responsibility is borne for outcomes	High accountability = Low exposure
Orchestration Load	How much work involves coordinating people and systems	High orchestration = Low exposure
2.2 Signal Extraction Examples
Routine Density
Detection patterns: Sequential processes ("first X, then Y"), template-based outputs, checklist language, scheduled/recurring mentions.
    • High signal: "I process 50 invoices weekly using the same validation steps"
    • Low signal: "I investigate discrepancies when the numbers feel off"
Decision Ambiguity
Detection patterns: Hedging language ("it depends"), stakeholder reference, incomplete information mentions, tradeoff language.
    • High signal: "I decide whether to escalate based on relationship history and political context"
    • Low signal: "I approve requests that meet all five criteria"
Trust Dependency
Detection patterns: Relationship verbs ("advise", "negotiate"), emotion management, representation language.
    • High signal: "I handle difficult client conversations when deals are at risk"
    • Low signal: "I send automated status updates to stakeholders"
2.3 Perceived Future Role Archetypes
Based on signal combinations, users are mapped to one of five future role archetypes. These are trajectory indicators, not predictions.

Archetype	Signal Profile	Future Position
AI Orchestrator	High orchestration, moderate routine	Directs AI systems, quality control, exception handling
Judgment Specialist	High ambiguity, high accountability, high novelty	Makes calls AI cannot, handles ambiguous situations
Relationship Anchor	High trust dependency, moderate orchestration	Human face of organization, trust-based interactions
Hybrid Professional	Balanced signals across dimensions	Mix of AI-assisted and human-exclusive work
Transition Candidate	High routine, low ambiguity, low accountability	Work highly automatable—active repositioning needed

3. End-to-End UX Narrative
The assessment flow is designed as a narrative arc, not a form submission. Each screen advances user understanding while building toward actionable insight.
3.1 Start Screen — "The Mirror"
PURPOSE
Establish credibility, differentiate from fear-based tools, invite self-reflection rather than passive consumption.
EMOTIONAL STATE
Curious but guarded. User expects another doomsday calculator.
PRIMARY HEADLINE
"Your job title says nothing about your work. Let's look at what you actually do."
SUPPORTING COPY
AI doesn't automate jobs—it automates tasks. Some of what you do is already being done by AI. Some of it can't be. The difference isn't your title. It's the specific activities that fill your days.
This takes 10 minutes. You'll describe 3–5 of your core tasks. We'll analyze them for patterns that matter—not to scare you, but to show you where your leverage is.
Killer sentence: "We don't predict. We clarify."
CTA
"Show me what I'm working with"
3.2 Task Input Screen — "The Inventory"
PURPOSE
Capture rich task descriptions that reveal signals. Guide users away from job-title thinking into actual work description.
PROMPT HEADLINE
"Walk me through a typical week. What actually takes your time?"
INPUT GUIDANCE
Don't list responsibilities. Describe activities. Instead of "project management," try "I spend 3 hours weekly chasing updates from engineers who don't respond to Slack."
EXAMPLE TRANSFORMATION

Too Vague	Rich Enough
"Project management"	"I run weekly standups, chase engineers for updates, and decide when to escalate blockers"
"Data analysis"	"I pull sales data, build pivot tables, and write narrative summaries for non-technical stakeholders"
Killer sentence: "The details reveal the truth. Be specific."
3.3 Clarifying Questions — "The Depth Probe"
PURPOSE
Extract signals that task descriptions alone don't reveal. Maximize information gain per question.
Q1: Context Dependency
"Think about your last 5 working days. How many of your completed tasks could a competent new hire do on day one—with access to your files, but no handover from you?"
    • Almost all of them / About half / Very few / Almost none
Signal unlocked: Institutional knowledge dependency. High "almost none" = lower exposure.
Q2: Accountability Scope
"When something goes wrong in your area, who explains why to leadership—you, or someone else?"
    • Someone else / I contribute / I usually lead / I'm accountable for outcomes
Signal unlocked: Accountability weight. "I'm accountable" = lower exposure.
Q3: Environmental Pressure
"In the past 12 months, have you noticed any of these at work?"
    • A tool now does something I used to do manually
    • I've been asked to "review AI output" instead of creating from scratch
    • I've had to justify why a task needs a human instead of automation
Signal unlocked: Real-world displacement velocity. Multiple = exposure materializing.
Killer sentence: "These questions have no wrong answers—only honest ones."

3.4 Analysis Screen — "The Processing"
PURPOSE
Build anticipation. Communicate that actual analysis is happening. Reduce score anxiety by explaining methodology before revealing results.
DISPLAY SEQUENCE
Animated progress with staged messaging (each ~3-4 seconds):
    1. "Mapping your tasks to AI capability domains..."
    2. "Analyzing decision patterns and judgment requirements..."
    3. "Identifying your highest-leverage activities..."
    4. "Building your personalized exposure profile..."
Killer sentence: "We're not looking up your job. We're reading your work."
3.5 Score Screen — "The Mirror Moment"
PURPOSE
Deliver the exposure score with emotional intelligence. Frame numbers as starting points, not verdicts.
EMOTIONAL FRAMING BY BAND

Band	Range	Framing Copy
Protected	<30%	"Your work has strong human moats. Most of what you do requires judgment, relationships, or accountability that AI cannot replicate."
Mixed	30-50%	"Your work is a mix of automatable and human-exclusive tasks. Your opportunity: move time from the first to the second."
Exposed	50-70%	"A significant portion of your work follows patterns AI handles well. This isn't a crisis—it's a signal."
Critical	>70%	"Most of your described work falls where AI is already capable. This requires active attention—not panic."
Killer sentence: "This isn't a verdict. It's a lens."
3.6 Breakdown Screen — "The Anatomy"
PURPOSE
Show exactly which tasks drive exposure and why. Introduce the three-category framework.
TASK CATEGORIES
Each task is assigned to one of three future-role categories—not just risk levels, but how the task will exist in 2-5 years.

Category	Meaning	User Action
AUTOMATED	AI already does this reliably. Task likely disappears within 1-3 years.	Delegate to AI now. Reclaim time for higher-value work.
AI-ASSISTED	AI does heavy lifting, human oversight needed. Role shifts from creator to editor.	Learn to orchestrate AI. Move value from execution to judgment.
HUMAN MOAT	Requires trust, accountability, or ambiguity AI cannot handle. Protected 5+ years.	Expand and deepen. Make this larger share of your work.
Killer sentence: "Your work isn't one thing. It's many things—some stable, some shifting."

3.7 Roadmap Screen — "The Path Forward"
PURPOSE
Transform analysis into action. Frame changes as identity evolution, not task-level fixes.
HEADLINE
"Your exposure isn't fixed. Here's how it shifts."
ACTION CATEGORIES
Delegate to AI
Tasks in "Automated" category the user still does manually. Action: stop doing them, or use AI tooling to compress them.
Example: "Your weekly status report synthesis is highly automatable. Use AI summarization to reduce from 2 hours to 20 minutes—then invest saved time in stakeholder relationships."
Elevate Your Role
Tasks in "AI-Assisted" where user can move from executor to orchestrator.
Example: "You currently write first drafts of proposals. Shift to briefing AI on client context, then refining. Your value moves from drafting to judgment."
Amplify Your Moat
Tasks in "Human Moat" the user should deliberately expand or deepen.
Example: "Your conflict resolution in cross-team disputes is rare and valuable. Document your approach. Train others. Become the person leadership calls when things get stuck."
Killer sentence: "The goal isn't to outrun AI. It's to work where AI can't follow."
3.8 Summary Screen — "The Commitment"
PURPOSE
Close the loop. Provide portable summary. Enable commitment tracking. Set up for return visits.
STRUCTURE
    • Overall exposure score + band
    • Top 3 exposure drivers
    • Perceived future role archetype
    • Committed actions (if any marked "Adopted")
RETURN PROMPT
"Assessments like this are most useful when revisited every 3-6 months. Your work changes. So should your strategy."
Killer sentence: "Knowing isn't enough. What will you do differently?"

4. "If You Do Nothing vs If You Act" Scenario
How do we communicate urgency without fear-mongering? The answer is comparative projection—showing two plausible futures based on action vs inaction.
4.1 Visual Concept
Two columns showing parallel trajectories over 6, 12, and 24 months.

IF YOU DO NOTHING	IF YOU ACT
Current work continues, but perceived value declines as others adopt AI tools.	You adopt AI tools for automatable tasks, freeing time for higher-judgment work.
Tasks you do manually become expectations AI handles. More work, less differentiation.	Known for judgment and orchestration, not execution. Exposure score decreases.
When restructuring happens, your role looks like overhead. Competing with those who adapted.	When restructuring happens, positioned in work AI cannot replace. The shift accelerated you.
4.2 Copy Principles
    • No fear language: Avoid "replaced," "obsolete." Use "compressed," "shifted," "evolved."
    • Agency emphasis: Both scenarios show user as active participant, not passive victim.
    • Probability language: "likely," "tends to"—never "will" or "definitely."
    • Concrete over abstract: Reference specific tasks from user's input.
4.3 Urgency Without Fear
The scenario uses opportunity cost framing: the risk isn't that AI will take your job—it's that you'll miss the window to position yourself advantageously.
Supporting copy: "Most professionals adapt eventually. The ones who adapt first don't just survive—they gain leverage. The window isn't closing, but it is narrowing."
Killer sentence: "The change is coming either way. The only question is whether you're steering it."

Appendix: Complete Microcopy Reference
Killer Sentences by Screen

Screen	Killer Sentence
Start	"We don't predict. We clarify."
Task Input	"The details reveal the truth. Be specific."
Questions	"These questions have no wrong answers—only honest ones."
Analysis	"We're not looking up your job. We're reading your work."
Score	"This isn't a verdict. It's a lens."
Breakdown	"Your work isn't one thing. It's many things—some stable, some shifting."
Roadmap	"The goal isn't to outrun AI. It's to work where AI can't follow."
Summary	"Knowing isn't enough. What will you do differently?"
Scenario	"The change is coming either way. The only question is whether you're steering it."
Tone Guidelines
    • Clear: No jargon, no hedging, no unnecessary qualifications
    • Confident: We know what we're doing; we don't apologize for the assessment
    • Calm: No urgency theater, no countdown timers, no scare tactics
    • Confrontational (constructively): We challenge assumptions; we don't let users off the hook
Forbidden Words
Avoid: optimize, unlock, crush, dominate, supercharge, revolutionize, game-changing, cutting-edge, synergy, leverage (as verb), empower, disrupt, pivot, actionable insights
Also avoid: replaced, obsolete, eliminated, doomed, threatened. Use: compressed, shifted, evolved, repositioned.
— End of Specification —