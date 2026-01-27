import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

/**
 * Locked 5-question questionnaire per CLAUDE.md:
 * Q1. Role target
 * Q2. Last time worked in this role
 * Q3. Urgency
 * Q4. Recent work examples
 * Q5. Main blocker
 */
@Component({
  selector: 'app-questionnaire',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-950 flex flex-col items-center p-8">
      <h1 class="text-3xl font-bold text-white mb-8">Quick Assessment</h1>

      <div class="w-full max-w-lg space-y-6">
        <div>
          <label class="block text-gray-300 mb-2">1. What role are you targeting?</label>
          <input
            type="text"
            [(ngModel)]="answers.roleTarget"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
            placeholder="e.g., Senior Software Engineer"
          />
        </div>

        <div>
          <label class="block text-gray-300 mb-2">2. When did you last work in this role?</label>
          <select
            [(ngModel)]="answers.lastWorkedInRole"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="">Select...</option>
            <option value="current">Currently in this role</option>
            <option value="<6months">Less than 6 months ago</option>
            <option value="6-12months">6-12 months ago</option>
            <option value="12-18months">12-18 months ago</option>
            <option value=">18months">More than 18 months ago</option>
            <option value="never">Never worked in this role</option>
          </select>
        </div>

        <div>
          <label class="block text-gray-300 mb-2">3. How urgently do you need a new job?</label>
          <select
            [(ngModel)]="answers.urgency"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="">Select...</option>
            <option value="immediate">Immediately (within 2 weeks)</option>
            <option value="soon">Soon (1-2 months)</option>
            <option value="exploring">Just exploring (3+ months)</option>
          </select>
        </div>

        <div>
          <label class="block text-gray-300 mb-2">4. Describe a recent relevant work example</label>
          <textarea
            [(ngModel)]="answers.recentWorkExamples"
            rows="3"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
            placeholder="Briefly describe a project or achievement relevant to your target role..."
          ></textarea>
        </div>

        <div>
          <label class="block text-gray-300 mb-2">5. What's your main blocker right now?</label>
          <select
            [(ngModel)]="answers.mainBlocker"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="">Select...</option>
            <option value="cv">My CV doesn't represent me well</option>
            <option value="skills">I lack specific skills for the role</option>
            <option value="experience">I don't have enough relevant experience</option>
            <option value="interviews">I struggle with interviews</option>
            <option value="market">The job market is tough</option>
            <option value="unsure">I'm not sure what's holding me back</option>
          </select>
        </div>
      </div>

      <div class="flex gap-4 mt-8">
        <button
          (click)="submit()"
          [disabled]="!isComplete()"
          class="bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-colors"
        >
          Get My Assessment
        </button>
        <button
          (click)="useSampleAnswers()"
          class="bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-3 px-8 rounded-lg transition-colors border border-gray-600"
        >
          Use Sample Answers
        </button>
      </div>
    </div>
  `,
})
export class QuestionnaireComponent {
  answers = {
    roleTarget: '',
    lastWorkedInRole: '',
    urgency: '',
    recentWorkExamples: '',
    mainBlocker: '',
  };

  constructor(private router: Router) {}

  isComplete(): boolean {
    return !!(
      this.answers.roleTarget &&
      this.answers.lastWorkedInRole &&
      this.answers.urgency &&
      this.answers.recentWorkExamples &&
      this.answers.mainBlocker
    );
  }

  submit(): void {
    // TODO: Call /api/taskexposure/submit
    const assessmentId = 'placeholder-id';
    this.router.navigate(['/result', assessmentId]);
  }

  useSampleAnswers(): void {
    // Fill with sample data and go to demo result
    this.answers = {
      roleTarget: 'Senior Software Engineer',
      lastWorkedInRole: '6-12months',
      urgency: 'soon',
      recentWorkExamples: 'Led migration of monolithic app to microservices, reducing deployment time by 60%.',
      mainBlocker: 'cv',
    };
    // Navigate to demo result
    this.router.navigate(['/result', 'demo']);
  }
}
