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
        <h2>🎯 Konkreetne tegevusplaan</h2>
        <p class="subtitle">Mitte "õpi Python" vaid täpsed sammud konkreetsete ressurssidega</p>
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
                @if (rec.urgency === 'critical') { 🔴 Kriitiline }
                @else if (rec.urgency === 'important') { 🟡 Oluline }
                @else { 🟢 Kasulik }
              </div>
              <div class="time-badge">⏱ {{ rec.timeToLearn }}</div>
            </div>

            <h3 class="skill-name">{{ rec.skill }}</h3>
            <p class="reason">{{ rec.reason }}</p>

            <div class="roi-box">
              <span class="roi-label">ROI:</span>
              <span class="roi-value">{{ rec.roi }}</span>
            </div>

            <div class="resources">
              <h4>📚 Ressursid (alusta siit):</h4>
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
                      {{ resource.price === 'free' ? 'Tasuta' : 'Tasuline' }}
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
                ✓ Alustasin
              } @else {
                Alusta õppimist →
              }
            </button>
          </div>
        }
      </div>

      @if (filteredRecommendations().length === 0) {
        <div class="empty-state">
          <p>Selles kategoorias soovitusi pole. Vali teine filter.</p>
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
      color: #f1f5f9;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: #64748b;
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
      border-radius: 8px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-btn:hover {
      background: rgba(255,255,255,0.1);
    }

    .filter-btn.active {
      background: rgba(16, 185, 129, 0.2);
      border-color: #10b981;
      color: #10b981;
    }

    .recommendations-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .rec-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.2s;
    }

    .rec-card.critical {
      border-left: 4px solid #ef4444;
    }

    .rec-card.important {
      border-left: 4px solid #f59e0b;
    }

    .rec-card.nice-to-have {
      border-left: 4px solid #10b981;
    }

    .rec-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .urgency-badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-weight: 500;
    }

    .urgency-badge.critical {
      background: rgba(239, 68, 68, 0.2);
      color: #fca5a5;
    }

    .urgency-badge.important {
      background: rgba(245, 158, 11, 0.2);
      color: #fcd34d;
    }

    .urgency-badge.nice-to-have {
      background: rgba(16, 185, 129, 0.2);
      color: #6ee7b7;
    }

    .time-badge {
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .skill-name {
      font-size: 1.25rem;
      color: #f1f5f9;
      margin-bottom: 0.5rem;
    }

    .reason {
      color: #94a3b8;
      font-size: 0.875rem;
      line-height: 1.5;
      margin-bottom: 1rem;
    }

    .roi-box {
      background: rgba(16, 185, 129, 0.1);
      border-radius: 8px;
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .roi-label {
      color: #64748b;
      font-size: 0.875rem;
    }

    .roi-value {
      color: #10b981;
      font-weight: 600;
    }

    .resources h4 {
      font-size: 0.875rem;
      color: #94a3b8;
      margin-bottom: 0.75rem;
    }

    .resource-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 8px;
      margin-bottom: 0.5rem;
      color: #e2e8f0;
      text-decoration: none;
      transition: all 0.2s;
    }

    .resource-link:hover {
      background: rgba(255,255,255,0.05);
      border-color: #10b981;
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
      color: #64748b;
    }

    .price-badge {
      font-size: 0.625rem;
      padding: 0.125rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;
      font-weight: 600;
    }

    .price-badge.free {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }

    .price-badge.paid {
      background: rgba(139, 92, 246, 0.2);
      color: #a78bfa;
    }

    .external-icon {
      width: 16px;
      height: 16px;
      color: #64748b;
    }

    .start-btn {
      width: 100%;
      margin-top: 1rem;
      padding: 0.75rem;
      border-radius: 8px;
      background: linear-gradient(135deg, #10b981, #06d6a0);
      border: none;
      color: #0f172a;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .start-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #64748b;
    }
  `]
})
export class ActionRecommendationsComponent {
  @Input() userRole = 'Software Engineer';
  @Input() userSkills: string[] = [];

  activeFilter = signal<string>('all');
  startedSkills = signal<string[]>([]);

  filters = [
    { label: 'Kõik', value: 'all' },
    { label: '🔴 Kriitilised', value: 'critical' },
    { label: '🟡 Olulised', value: 'important' },
    { label: '🟢 Kasulikud', value: 'nice-to-have' }
  ];

  recommendations: Recommendation[] = [
    {
      skill: 'AI/ML põhitõed',
      urgency: 'critical',
      timeToLearn: '4-6 nädalat',
      reason: 'AI-ga töötamine on muutumas kohustuslikuks. Isegi kui sa ei ehita ML mudeleid, pead mõistma kuidas neid integreerida.',
      roi: '+40% palgakasv AI-seotud rollides',
      resources: [
        {
          name: 'fast.ai Practical Deep Learning',
          type: 'course',
          url: 'https://course.fast.ai/',
          price: 'free',
          duration: '7 nädalat'
        },
        {
          name: 'Google ML Crash Course',
          type: 'course',
          url: 'https://developers.google.com/machine-learning/crash-course',
          price: 'free',
          duration: '15 tundi'
        },
        {
          name: 'Ehita oma AI projekt',
          type: 'project',
          url: 'https://github.com/practical-tutorials/project-based-learning#machine-learning',
          price: 'free',
          duration: '2-4 nädalat'
        }
      ]
    },
    {
      skill: 'TypeScript mastery',
      urgency: 'critical',
      timeToLearn: '2-3 nädalat',
      reason: 'TypeScript on de facto standard. JS-only projektid on muutumas harvaks. Tööpakkumistes nõutakse 85% juhtudest.',
      roi: '+25% rohkem tööpakkumisi',
      resources: [
        {
          name: 'TypeScript Deep Dive',
          type: 'book',
          url: 'https://basarat.gitbook.io/typescript/',
          price: 'free',
          duration: '1 nädal'
        },
        {
          name: 'Total TypeScript (Matt Pocock)',
          type: 'course',
          url: 'https://www.totaltypescript.com/',
          price: 'paid',
          duration: '40 tundi'
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
      timeToLearn: '4-8 nädalat',
      reason: 'Senior rollid nõuavad süsteemi disaini oskust. AI ei asenda arhitektuurilisi otsuseid.',
      roi: 'Vajalik Staff+ rollidele',
      resources: [
        {
          name: 'System Design Primer',
          type: 'tutorial',
          url: 'https://github.com/donnemartin/system-design-primer',
          price: 'free',
          duration: '2-4 nädalat'
        },
        {
          name: 'Designing Data-Intensive Applications',
          type: 'book',
          url: 'https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/',
          price: 'paid',
          duration: '4-6 nädalat'
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
      skill: 'Cloud Sertifikaadid (AWS/GCP)',
      urgency: 'important',
      timeToLearn: '6-8 nädalat',
      reason: 'Cloud oskused on nõutud 70%+ tööpakkumistes. Sertifikaat annab konkreetse tõendi.',
      roi: '+15-20% palgalisa sertifikaadiga',
      resources: [
        {
          name: 'AWS Solutions Architect (Cantrill)',
          type: 'course',
          url: 'https://learn.cantrill.io/',
          price: 'paid',
          duration: '60+ tundi'
        },
        {
          name: 'AWS Free Tier + Tutorials',
          type: 'tutorial',
          url: 'https://aws.amazon.com/getting-started/',
          price: 'free',
          duration: 'Ongoing'
        },
        {
          name: 'Google Cloud Skills Boost',
          type: 'course',
          url: 'https://www.cloudskillsboost.google/',
          price: 'free',
          duration: '40+ tundi'
        }
      ]
    },
    {
      skill: 'Kubernetes & Container Orchestration',
      urgency: 'nice-to-have',
      timeToLearn: '3-4 nädalat',
      reason: 'K8s on muutunud standard enterprise keskkonnas. DevOps karjäärile hädavajalik.',
      roi: 'DevOps rollid +30% kõrgem palk',
      resources: [
        {
          name: 'Kubernetes the Hard Way',
          type: 'tutorial',
          url: 'https://github.com/kelseyhightower/kubernetes-the-hard-way',
          price: 'free',
          duration: '1 nädal'
        },
        {
          name: 'CKA Sertifikaat',
          type: 'certification',
          url: 'https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/',
          price: 'paid',
          duration: '4-6 nädalat'
        }
      ]
    },
    {
      skill: 'Prompt Engineering & AI Tools',
      urgency: 'critical',
      timeToLearn: '1-2 nädalat',
      reason: 'AI tööriistad (Copilot, Claude, ChatGPT) suurendavad produktiivsust 2-3x. Nende efektiivne kasutamine on konkurentsieelis.',
      roi: '2-3x produktiivsuse kasv',
      resources: [
        {
          name: 'Anthropic Prompt Engineering Guide',
          type: 'tutorial',
          url: 'https://docs.anthropic.com/claude/docs/prompt-engineering',
          price: 'free',
          duration: '2-3 tundi'
        },
        {
          name: 'GitHub Copilot Labs',
          type: 'tutorial',
          url: 'https://githubnext.com/projects/copilot-labs',
          price: 'free',
          duration: '1 päev'
        },
        {
          name: 'Building LLM Applications',
          type: 'course',
          url: 'https://www.deeplearning.ai/short-courses/',
          price: 'free',
          duration: '1-2 nädalat'
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
      case 'course': return '🎓';
      case 'book': return '📖';
      case 'tutorial': return '💻';
      case 'certification': return '🏆';
      case 'project': return '🔨';
      default: return '📄';
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
