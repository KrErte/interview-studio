import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Recommendation {
  skill: string;
  urgency: 'critical' | 'important' | 'nice-to-have';
  timeToLearn: string;
  reason: string;
  resources: Resource[];
  roi: string;
}

interface Resource {
  name: string;
  type: 'course' | 'book' | 'tutorial' | 'certification' | 'project';
  url: string;
  price: 'free' | 'paid';
  duration: string;
}

@Component({
  selector: 'app-action-recommendations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="recommendations-container">
      <div class="header">
        <h2>Concrete Action Plan</h2>
        <p class="subtitle">Not "learn Python" but exact steps with specific resources</p>
      </div>

      <div class="filters">
        <button
          *ngFor="let filter of filters"
          class="filter-btn"
          [class.active]="activeFilter() === filter.value"
          (click)="setFilter(filter.value)">
          {{ filter.label }}
        </button>
      </div>

      <div class="recommendations-list">
        @for (rec of filteredRecommendations(); track rec.skill) {
          <div class="rec-card" [class]="rec.urgency">
            <div class="rec-header">
              <div class="urgency-badge" [class]="rec.urgency">
                @if (rec.urgency === 'critical') { Critical }
                @else if (rec.urgency === 'important') { Important }
                @else { Nice to have }
              </div>
              <div class="time-badge">{{ rec.timeToLearn }}</div>
            </div>

            <h3 class="skill-name">{{ rec.skill }}</h3>
            <p class="reason">{{ rec.reason }}</p>

            <div class="roi-box">
              <span class="roi-label">ROI:</span>
              <span class="roi-value">{{ rec.roi }}</span>
            </div>

            <div class="resources">
              <h4>Resources (start here):</h4>
              @for (resource of rec.resources; track resource.url) {
                <a
                  [href]="resource.url"
                  target="_blank"
                  rel="noopener"
                  class="resource-link"
                  [class]="resource.price">
                  <span class="resource-type">{{ getTypeEmoji(resource.type) }}</span>
                  <span class="resource-name">{{ resource.name }}</span>
                  <span class="resource-meta">
                    <span class="duration">{{ resource.duration }}</span>
                    <span class="price-badge" [class]="resource.price">
                      {{ resource.price === 'free' ? 'Free' : 'Paid' }}
                    </span>
                  </span>
                  <svg class="external-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              }
            </div>

            <button class="start-btn" (click)="markStarted(rec.skill)">
              @if (startedSkills().includes(rec.skill)) {
                Started
              } @else {
                Start learning
              }
            </button>
          </div>
        }
      </div>

      @if (filteredRecommendations().length === 0) {
        <div class="empty-state">
          <p>No recommendations in this category. Choose a different filter.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .recommendations-container {
      padding: 1.5rem;
    }

    .header {
      margin-bottom: 1.5rem;
    }

    .header h2 {
      font-size: 1.5rem;
      color: #1c1917;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }

    .subtitle {
      color: #57534e;
      font-size: 0.875rem;
    }

    .filters {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 0.5rem 1rem;
      background: white;
      border: 1px solid #e7e5e4;
      color: #a8a29e;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 700;
    }

    .filter-btn:hover {
      background: #fafaf9;
    }

    .filter-btn.active {
      background: #1c1917;
      border-color: #1c1917;
      color: white;
    }

    .recommendations-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .rec-card {
      background: white;
      border: 1px solid #e7e5e4;
      padding: 1.5rem;
      transition: all 0.2s;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    .rec-card.critical {
      border-left: 4px solid #dc2626;
    }

    .rec-card.important {
      border-left: 4px solid #f59e0b;
    }

    .rec-card.nice-to-have {
      border-left: 4px solid #1c1917;
    }

    .rec-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .urgency-badge {
      font-size: 0.625rem;
      padding: 0.25rem 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .urgency-badge.critical {
      background: #fef2f2;
      color: #dc2626;
    }

    .urgency-badge.important {
      background: #fffbeb;
      color: #b45309;
    }

    .urgency-badge.nice-to-have {
      background: #fafaf9;
      color: #1c1917;
    }

    .time-badge {
      font-size: 0.75rem;
      color: #a8a29e;
    }

    .skill-name {
      font-size: 1.25rem;
      color: #1c1917;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }

    .reason {
      color: #57534e;
      font-size: 0.875rem;
      line-height: 1.5;
      margin-bottom: 1rem;
    }

    .roi-box {
      background: #fafaf9;
      border: 1px solid #e7e5e4;
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .roi-label {
      color: #57534e;
      font-size: 0.875rem;
    }

    .roi-value {
      color: #1c1917;
      font-weight: 700;
    }

    .resources h4 {
      font-size: 0.875rem;
      color: #57534e;
      margin-bottom: 0.75rem;
    }

    .resource-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: white;
      border: 1px solid #e7e5e4;
      margin-bottom: 0.5rem;
      color: #1c1917;
      text-decoration: none;
      transition: all 0.2s;
    }

    .resource-link:hover {
      background: #fafaf9;
      border-color: #1c1917;
    }

    .resource-type {
      font-size: 1.25rem;
    }

    .resource-name {
      flex: 1;
      font-size: 0.875rem;
    }

    .resource-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .duration {
      font-size: 0.75rem;
      color: #57534e;
    }

    .price-badge {
      font-size: 0.625rem;
      padding: 0.125rem 0.5rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    .price-badge.free {
      background: #fafaf9;
      color: #1c1917;
    }

    .price-badge.paid {
      background: #fef2f2;
      color: #dc2626;
    }

    .external-icon {
      width: 16px;
      height: 16px;
      color: #a8a29e;
    }

    .start-btn {
      width: 100%;
      margin-top: 1rem;
      padding: 0.75rem;
      background: #1c1917;
      border: none;
      color: white;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .start-btn:hover {
      background: #292524;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #57534e;
    }
  `]
})
export class ActionRecommendationsComponent {
  @Input() userRole = 'Software Engineer';
  @Input() userSkills: string[] = [];

  activeFilter = signal<string>('all');
  startedSkills = signal<string[]>([]);

  filters = [
    { label: 'All', value: 'all' },
    { label: 'Critical', value: 'critical' },
    { label: 'Important', value: 'important' },
    { label: 'Nice to have', value: 'nice-to-have' }
  ];

  recommendations: Recommendation[] = [
    {
      skill: 'AI/ML Fundamentals',
      urgency: 'critical',
      timeToLearn: '4-6 weeks',
      reason: 'Working with AI is becoming mandatory. AI/ML engineer salaries are +35% compared to regular developers (Palgainfo 2024).',
      roi: '+40% salary growth in AI-related roles (€5.8K median)',
      resources: [
        {
          name: 'TalTech - Machine Learning Basics',
          type: 'course',
          url: 'https://taltech.ee/en/artificial-intelligence',
          price: 'free',
          duration: '1 semester'
        },
        {
          name: 'Tartu Ülikool - Machine Learning',
          type: 'course',
          url: 'https://courses.cs.ut.ee/',
          price: 'free',
          duration: '1 semester'
        },
        {
          name: 'fast.ai Practical Deep Learning',
          type: 'course',
          url: 'https://course.fast.ai/',
          price: 'free',
          duration: '7 weeks'
        },
        {
          name: 'Google ML Crash Course',
          type: 'course',
          url: 'https://developers.google.com/machine-learning/crash-course',
          price: 'free',
          duration: '15 hours'
        }
      ]
    },
    {
      skill: 'Prompt Engineering & AI Tools',
      urgency: 'critical',
      timeToLearn: '1-2 weeks',
      reason: 'Bolt and Wise already require Copilot skills. AI tools increase productivity 2-3x.',
      roi: '2-3x productivity growth, competitive advantage',
      resources: [
        {
          name: 'Anthropic Prompt Engineering Guide',
          type: 'tutorial',
          url: 'https://docs.anthropic.com/claude/docs/prompt-engineering',
          price: 'free',
          duration: '2-3 hours'
        },
        {
          name: 'GitHub Copilot (free for students)',
          type: 'tutorial',
          url: 'https://education.github.com/pack',
          price: 'free',
          duration: 'Ongoing'
        },
        {
          name: 'DeepLearning.AI Short Courses',
          type: 'course',
          url: 'https://www.deeplearning.ai/short-courses/',
          price: 'free',
          duration: '1-2 weeks'
        }
      ]
    },
    {
      skill: 'TypeScript mastery',
      urgency: 'critical',
      timeToLearn: '2-3 weeks',
      reason: 'TypeScript is the de facto standard. According to CV.ee data, it is required in 78% of Estonian job postings.',
      roi: '+25% more job offers',
      resources: [
        {
          name: 'TypeScript Deep Dive',
          type: 'book',
          url: 'https://basarat.gitbook.io/typescript/',
          price: 'free',
          duration: '1 week'
        },
        {
          name: 'Total TypeScript (Matt Pocock)',
          type: 'course',
          url: 'https://www.totaltypescript.com/',
          price: 'paid',
          duration: '40 hours'
        },
        {
          name: 'Type Challenges',
          type: 'tutorial',
          url: 'https://github.com/type-challenges/type-challenges',
          price: 'free',
          duration: 'Ongoing'
        }
      ]
    },
    {
      skill: 'System Design',
      urgency: 'important',
      timeToLearn: '4-8 weeks',
      reason: 'Always asked in Bolt, Wise, Veriff interviews. Senior+ roles require architecture skills.',
      roi: 'Required for Staff+ roles (€5-8K/month)',
      resources: [
        {
          name: 'System Design Primer',
          type: 'tutorial',
          url: 'https://github.com/donnemartin/system-design-primer',
          price: 'free',
          duration: '2-4 weeks'
        },
        {
          name: 'Designing Data-Intensive Applications',
          type: 'book',
          url: 'https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/',
          price: 'paid',
          duration: '4-6 weeks'
        },
        {
          name: 'ByteByteGo Newsletter',
          type: 'tutorial',
          url: 'https://blog.bytebytego.com/',
          price: 'free',
          duration: 'Weekly'
        }
      ]
    },
    {
      skill: 'Cybersecurity',
      urgency: 'important',
      timeToLearn: '8-12 weeks',
      reason: 'As an e-government leader, Estonia focuses on cybersecurity. RIA and defense forces constantly seek specialists.',
      roi: 'Security roles €4-7K/month, stable demand',
      resources: [
        {
          name: 'TalTech Cybersecurity Master\'s Program',
          type: 'course',
          url: 'https://taltech.ee/en/cyber-security',
          price: 'paid',
          duration: '2 years'
        },
        {
          name: 'SANS CyberTalent (scholarships)',
          type: 'certification',
          url: 'https://www.sans.org/cybertalent/',
          price: 'free',
          duration: '3-6 months'
        },
        {
          name: 'HackTheBox / TryHackMe',
          type: 'tutorial',
          url: 'https://www.hackthebox.com/',
          price: 'free',
          duration: 'Ongoing'
        }
      ]
    },
    {
      skill: 'Cloud Certifications (AWS/GCP)',
      urgency: 'important',
      timeToLearn: '6-8 weeks',
      reason: 'AWS dominates the Estonian market (72% of CV.ee postings). Certification provides concrete proof of skills.',
      roi: '+15-20% salary increase (€600-900/month)',
      resources: [
        {
          name: 'AWS re/Start Program in Estonia',
          type: 'course',
          url: 'https://aws.amazon.com/training/restart/',
          price: 'free',
          duration: '12 weeks'
        },
        {
          name: 'AWS Solutions Architect (Cantrill)',
          type: 'course',
          url: 'https://learn.cantrill.io/',
          price: 'paid',
          duration: '60+ hours'
        },
        {
          name: 'Google Cloud Skills Boost',
          type: 'course',
          url: 'https://www.cloudskillsboost.google/',
          price: 'free',
          duration: '40+ hours'
        }
      ]
    },
    {
      skill: 'Kubernetes & DevOps',
      urgency: 'nice-to-have',
      timeToLearn: '3-4 weeks',
      reason: 'K8s is standard at Bolt, Wise, and other large companies. DevOps roles +52% growth in Estonia (CV.ee).',
      roi: 'DevOps €4.3K median salary (+18% YoY)',
      resources: [
        {
          name: 'Kubernetes the Hard Way',
          type: 'tutorial',
          url: 'https://github.com/kelseyhightower/kubernetes-the-hard-way',
          price: 'free',
          duration: '1 week'
        },
        {
          name: 'CKA Certification',
          type: 'certification',
          url: 'https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/',
          price: 'paid',
          duration: '4-6 weeks'
        }
      ]
    },
    {
      skill: 'Estonian Tech Community',
      urgency: 'nice-to-have',
      timeToLearn: 'Ongoing',
      reason: 'Networking is critical in Estonia\'s small market. Internal hiring is common.',
      roi: 'Better access to jobs, mentorship',
      resources: [
        {
          name: 'Garage48 Hackathons',
          type: 'project',
          url: 'https://garage48.org/',
          price: 'free',
          duration: '48 hours'
        },
        {
          name: 'Startup Estonia Community',
          type: 'tutorial',
          url: 'https://startupestonia.ee/',
          price: 'free',
          duration: 'Ongoing'
        },
        {
          name: 'Bolt Engineering Blog',
          type: 'tutorial',
          url: 'https://medium.com/bolt-labs',
          price: 'free',
          duration: 'Ongoing'
        },
        {
          name: 'Wise Tech Blog',
          type: 'tutorial',
          url: 'https://wise.com/tech/',
          price: 'free',
          duration: 'Ongoing'
        }
      ]
    }
  ];

  filteredRecommendations = computed(() => {
    const filter = this.activeFilter();
    if (filter === 'all') return this.recommendations;
    return this.recommendations.filter(r => r.urgency === filter);
  });

  setFilter(filter: string) {
    this.activeFilter.set(filter);
  }

  getTypeEmoji(type: string): string {
    switch (type) {
      case 'course': return '>';
      case 'book': return '>';
      case 'tutorial': return '>';
      case 'certification': return '>';
      case 'project': return '>';
      default: return '>';
    }
  }

  markStarted(skill: string) {
    const current = this.startedSkills();
    if (!current.includes(skill)) {
      this.startedSkills.set([...current, skill]);
      // Save to localStorage
      localStorage.setItem('startedSkills', JSON.stringify(this.startedSkills()));
    }
  }

  ngOnInit() {
    // Load from localStorage
    const saved = localStorage.getItem('startedSkills');
    if (saved) {
      this.startedSkills.set(JSON.parse(saved));
    }
  }
}
