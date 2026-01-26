/*
 * Copyright 2025 TASKEXPOSURE
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  JobMarketState,
  JobMarketAnswers,
  JobMarketFreeResult,
  JobMarketPaidResult,
  JobMarketStatus,
  Blocker,
  WeeklyAction,
  CvRewriteBullet,
} from '../../shared/models/job-market.model';

@Injectable({ providedIn: 'root' })
export class JobMarketService {
  private state$ = new BehaviorSubject<JobMarketState>({ isPaid: false });

  get state(): JobMarketState {
    return this.state$.getValue();
  }

  setCvData(fileName: string, cvText: string): void {
    this.state$.next({ ...this.state, cvFileName: fileName, cvText });
  }

  setAnswers(answers: JobMarketAnswers): void {
    this.state$.next({ ...this.state, answers });
    this.generateResults();
  }

  markAsPaid(): void {
    this.state$.next({ ...this.state, isPaid: true });
  }

  reset(): void {
    this.state$.next({ isPaid: false });
  }

  private generateResults(): void {
    const answers = this.state.answers;
    if (!answers) return;

    const status = this.calculateStatus(answers);
    const blockers = this.generateBlockers(answers, status);
    const teaserAction = this.generateTeaserAction(answers, status);

    const freeResult: JobMarketFreeResult = {
      status,
      statusExplanation: this.getStatusExplanation(status, answers),
      blockers,
      teaserAction,
    };

    const paidResult: JobMarketPaidResult = {
      ...freeResult,
      weeklyPlan: this.generateWeeklyPlan(answers, status),
      cvRewriteBullets: this.generateCvBullets(answers),
      rolesToAvoid: this.generateRolesToAvoid(answers),
      pivotSuggestion: this.generatePivotSuggestion(answers),
    };

    this.state$.next({ ...this.state, freeResult, paidResult });
  }

  private calculateStatus(answers: JobMarketAnswers): JobMarketStatus {
    // RED conditions:
    // - Last relevant work over 18 months ago
    // - OR career switch with no recent examples
    // - OR urgent need with weak signals
    const isWorkOld = answers.lastWorkTiming === 'more-than-2-years' ||
                      answers.lastWorkTiming === '12-24-months';
    const isCareerSwitch = answers.roleTarget === 'career-switch';
    const noRecentExamples = answers.workExamples === 'none' ||
                             answers.workExamples === 'personal-only';
    const isUrgent = answers.urgency === 'immediate';
    const hasWeakSignals = noRecentExamples || answers.lastWorkTiming === 'never';

    if (answers.lastWorkTiming === 'more-than-2-years' || answers.lastWorkTiming === 'never') {
      return 'red';
    }
    if (isCareerSwitch && noRecentExamples) {
      return 'red';
    }
    if (isUrgent && hasWeakSignals) {
      return 'red';
    }

    // GREEN conditions:
    // - Recent relevant experience
    // - Clear role match
    // - Main issue is CV or positioning
    const isRecentWork = answers.lastWorkTiming === 'less-than-6-months';
    const isClearRole = answers.roleTarget === 'same-role' ||
                        answers.roleTarget === 'slight-step-up';
    const hasRealWork = answers.workExamples === 'real-production';
    const isPositioningIssue = answers.mainBlocker === 'not-getting-interviews';

    if (isRecentWork && isClearRole && hasRealWork) {
      return 'green';
    }
    if (isRecentWork && hasRealWork && isPositioningIssue) {
      return 'green';
    }

    // YELLOW: everything else
    return 'yellow';
  }

  private getStatusExplanation(status: JobMarketStatus, answers: JobMarketAnswers): string {
    switch (status) {
      case 'red':
        if (answers.lastWorkTiming === 'more-than-2-years' || answers.lastWorkTiming === 'never') {
          return 'Your experience gap is the main obstacle - you need to rebuild credibility before applying.';
        }
        if (answers.roleTarget === 'career-switch') {
          return 'Career switches require proof of new skills - you need concrete examples first.';
        }
        return 'Urgent timeline plus weak signals means high rejection risk - stabilize before pushing hard.';

      case 'yellow':
        if (answers.workExamples === 'some-outdated') {
          return 'Your experience exists but needs better framing - the story isn\'t landing yet.';
        }
        if (answers.roleTarget === 'big-step-up') {
          return 'Aiming higher is possible, but your current positioning doesn\'t support it yet.';
        }
        return 'You have relevant experience but it\'s not being communicated effectively.';

      case 'green':
        if (answers.mainBlocker === 'not-getting-interviews') {
          return 'Your background is solid - the issue is how you\'re presenting it on paper.';
        }
        return 'You\'re in a strong position - small adjustments will unlock more opportunities.';
    }
  }

  private generateBlockers(answers: JobMarketAnswers, status: JobMarketStatus): Blocker[] {
    const blockers: Blocker[] = [];

    // Blocker based on work timing
    if (answers.lastWorkTiming === 'more-than-2-years' || answers.lastWorkTiming === 'never') {
      blockers.push({
        title: 'Experience gap on your CV',
        description: 'Recruiters see the gap first, not your skills. You need recent proof of work.',
      });
    } else if (answers.lastWorkTiming === '12-24-months') {
      blockers.push({
        title: 'Dated experience weakens your case',
        description: 'Your most recent work is over a year old - it raises questions about what you\'ve been doing.',
      });
    }

    // Blocker based on work examples
    if (answers.workExamples === 'none') {
      blockers.push({
        title: 'No concrete proof of ability',
        description: 'Without examples, you\'re asking employers to take you at your word.',
      });
    } else if (answers.workExamples === 'personal-only') {
      blockers.push({
        title: 'Personal projects don\'t carry weight',
        description: 'Side projects show initiative but employers want professional-context results.',
      });
    } else if (answers.workExamples === 'some-outdated') {
      blockers.push({
        title: 'Examples don\'t reflect current skills',
        description: 'Your portfolio shows what you could do, not what you can do now.',
      });
    }

    // Blocker based on role targeting
    if (answers.roleTarget === 'career-switch') {
      blockers.push({
        title: 'No transfer story',
        description: 'Career switchers need a clear narrative connecting past work to new direction.',
      });
    } else if (answers.roleTarget === 'not-sure') {
      blockers.push({
        title: 'Unclear positioning',
        description: 'Applying broadly wastes time. Employers want candidates who know what they want.',
      });
    } else if (answers.roleTarget === 'big-step-up') {
      blockers.push({
        title: 'Ambition exceeds evidence',
        description: 'Big jumps require visible proof - your current profile doesn\'t support the ask.',
      });
    }

    // Blocker based on main issue
    if (answers.mainBlocker === 'failing-interviews' && blockers.length < 3) {
      blockers.push({
        title: 'Interview performance gap',
        description: 'Getting interviews but not offers means your verbal pitch isn\'t matching expectations.',
      });
    } else if (answers.mainBlocker === 'skills-gap' && blockers.length < 3) {
      blockers.push({
        title: 'Missing expected skills',
        description: 'Job descriptions list requirements you can\'t confidently claim.',
      });
    } else if (answers.mainBlocker === 'confidence-burnout' && blockers.length < 3) {
      blockers.push({
        title: 'Low energy signals in applications',
        description: 'Burnout shows in interviews and cover letters - employers sense hesitation.',
      });
    }

    // Fill to exactly 3 blockers
    if (blockers.length < 3) {
      if (!blockers.find(b => b.title.includes('CV'))) {
        blockers.push({
          title: 'CV doesn\'t tell a clear story',
          description: 'Your resume lists tasks instead of showing impact and progression.',
        });
      }
    }
    if (blockers.length < 3) {
      blockers.push({
        title: 'Applications blend into the pile',
        description: 'Generic applications get generic rejections. Personalization is missing.',
      });
    }

    return blockers.slice(0, 3);
  }

  private generateTeaserAction(answers: JobMarketAnswers, status: JobMarketStatus): string {
    if (status === 'red') {
      if (answers.lastWorkTiming === 'more-than-2-years' || answers.lastWorkTiming === 'never') {
        return 'Week 1 action: Start a micro-project you can ship and show in 7 days.';
      }
      return 'Week 1 action: Identify one achievable role and build proof specifically for it.';
    }
    if (status === 'yellow') {
      return 'Week 1 action: Rewrite your CV summary to lead with your strongest recent result.';
    }
    return 'Week 1 action: Send 5 targeted applications using the rewritten bullets we\'ll give you.';
  }

  private generateWeeklyPlan(answers: JobMarketAnswers, status: JobMarketStatus): WeeklyAction[] {
    const actions: WeeklyAction[] = [];

    if (status === 'red') {
      actions.push({
        week: 1,
        title: 'Build one proof point',
        description: 'Ship a small, visible project. Document the problem, your solution, and the result. This becomes your lead story.',
      });
      actions.push({
        week: 2,
        title: 'Update your online presence',
        description: 'LinkedIn headline and about section should reflect what you\'re targeting, not where you\'ve been.',
      });
      actions.push({
        week: 3,
        title: 'Research 10 target companies',
        description: 'Find companies hiring for your target role. Note their language, requirements, and culture signals.',
      });
      actions.push({
        week: 4,
        title: 'Send 5 warm outreach messages',
        description: 'Connect with people at target companies. Ask questions, don\'t pitch. Build visibility before applying.',
      });
    } else if (status === 'yellow') {
      actions.push({
        week: 1,
        title: 'Reframe your CV bullets',
        description: 'Replace task descriptions with impact statements. Use the formula: Action + Context + Result.',
      });
      actions.push({
        week: 2,
        title: 'Tighten your target',
        description: 'Pick 3 job titles you\'d accept. Reject everything else. Focus beats volume.',
      });
      actions.push({
        week: 3,
        title: 'Practice your pitch',
        description: 'Record yourself answering "tell me about yourself" until it sounds natural and specific.',
      });
      actions.push({
        week: 4,
        title: 'Apply strategically',
        description: 'Send 10 tailored applications. Each cover letter should reference something specific about that company.',
      });
    } else {
      actions.push({
        week: 1,
        title: 'Polish your CV',
        description: 'Apply the bullet rewrites we provided. Remove fluff. Lead with your strongest recent achievement.',
      });
      actions.push({
        week: 2,
        title: 'Optimize your LinkedIn',
        description: 'Match keywords from job descriptions. Add recent results to your experience section.',
      });
      actions.push({
        week: 3,
        title: 'Start targeted outreach',
        description: 'Apply to 15 roles that match your target. Personalize each application.',
      });
      actions.push({
        week: 4,
        title: 'Follow up and iterate',
        description: 'Track responses. Double down on what works. Adjust messaging based on feedback.',
      });
    }

    return actions.slice(0, 7);
  }

  private generateCvBullets(answers: JobMarketAnswers): CvRewriteBullet[] {
    // Generic examples that would be customized based on CV content in real implementation
    const bullets: CvRewriteBullet[] = [
      {
        original: 'Responsible for managing team projects',
        improved: 'Led 4-person team to deliver client portal 2 weeks ahead of schedule',
      },
      {
        original: 'Worked on improving system performance',
        improved: 'Reduced page load time by 40% through database query optimization',
      },
      {
        original: 'Handled customer support inquiries',
        improved: 'Resolved 50+ weekly support tickets with 95% satisfaction rating',
      },
      {
        original: 'Participated in code reviews',
        improved: 'Reviewed 200+ pull requests, catching 30+ production bugs pre-deployment',
      },
      {
        original: 'Helped with onboarding new team members',
        improved: 'Onboarded 6 developers using documentation system I created, cutting ramp-up time by 50%',
      },
    ];

    return bullets;
  }

  private generateRolesToAvoid(answers: JobMarketAnswers): string[] {
    const roles: string[] = [];

    if (answers.roleTarget === 'career-switch') {
      roles.push('Senior positions in your new field - start at mid-level to build credibility');
      roles.push('Roles requiring certifications you don\'t have');
    }

    if (answers.workExamples === 'none' || answers.workExamples === 'personal-only') {
      roles.push('Roles asking for "proven track record" or "X years of experience"');
    }

    if (answers.mainBlocker === 'confidence-burnout') {
      roles.push('High-pressure startup roles with undefined scope');
      roles.push('Positions requiring immediate on-call availability');
    }

    if (answers.roleTarget === 'big-step-up') {
      roles.push('Director-level roles when you haven\'t managed managers');
    }

    if (roles.length === 0) {
      roles.push('Roles significantly below your experience level - they\'ll question your motivation');
      roles.push('Companies with high turnover in your target department');
    }

    return roles.slice(0, 4);
  }

  private generatePivotSuggestion(answers: JobMarketAnswers): string | undefined {
    // Only suggest pivot if relevant
    if (answers.roleTarget !== 'career-switch' &&
        answers.mainBlocker !== 'skills-gap' &&
        answers.roleTarget !== 'not-sure') {
      return undefined;
    }

    if (answers.roleTarget === 'career-switch') {
      return 'Consider a bridge role that combines your existing skills with your target field. Example: If moving from marketing to product management, look for "Product Marketing Manager" roles first.';
    }

    if (answers.mainBlocker === 'skills-gap') {
      return 'Rather than competing for roles where you\'re underqualified, look for adjacent positions where your current skills are primary and target skills are secondary.';
    }

    if (answers.roleTarget === 'not-sure') {
      return 'Based on your background, consider exploring roles that value generalist skills: project management, operations, or customer success often reward diverse experience.';
    }

    return undefined;
  }
}
