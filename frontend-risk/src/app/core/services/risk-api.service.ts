import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiClient } from '../api/api-client.service';
import {
  RiskFlowAnswerRequest,
  RiskFlowAnswerResponse,
  RiskFlowEvaluateRequest,
  RiskFlowEvaluateResponse,
  RiskFlowStartRequest,
  RiskFlowStartResponse,
  RiskFlowNextRequest,
  RiskFlowNextResponse,
  RiskSummary,
  StartAssessmentRequest,
  StartAssessmentResponse,
  GetNextQuestionResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  GenerateRoadmapRequest,
  RoadmapResponse,
  AssessmentResult,
  RiskLevel,
  QuestionType,
  RoadmapDuration
} from '../models/risk.models';

// Mock mode flag - set to false when backend endpoints are ready
const USE_MOCKS = true;

@Injectable({ providedIn: 'root' })
export class RiskApiService {
  // Mock state
  private mockSessionId: string = '';
  private mockQuestionIndex: number = 0;
  private mockSkippedCount: number = 0;
  private mockAnswers: Map<string, string> = new Map();

  constructor(private api: ApiClient) {}

  // ============ EXISTING METHODS ============

  start(payload: RiskFlowStartRequest = {}): Observable<RiskFlowStartResponse> {
    return this.api.post<RiskFlowStartResponse>('/risk/flow/start', payload);
  }

  next(payload: RiskFlowNextRequest): Observable<RiskFlowNextResponse> {
    return this.api.post<RiskFlowNextResponse>('/risk/flow/next', payload);
  }

  answer(payload: RiskFlowAnswerRequest): Observable<RiskFlowAnswerResponse> {
    return this.api.post<RiskFlowAnswerResponse>('/risk/flow/answer', payload);
  }

  evaluate(payload: RiskFlowEvaluateRequest): Observable<RiskFlowEvaluateResponse> {
    return this.api.post<RiskFlowEvaluateResponse>('/risk/flow/evaluate', payload);
  }

  // Kept for backwards compatibility; not used by the new flow.
  getSummary(): Observable<RiskSummary> {
    return this.api.get<RiskSummary>('/risk/summary');
  }

  // ============ PRODUCT 1 METHODS ============

  /**
   * Start a new assessment with CV and experience data
   */
  startAssessment(request: StartAssessmentRequest): Observable<StartAssessmentResponse> {
    if (USE_MOCKS) {
      return this.mockStartAssessment(request);
    }
    return this.api.post<StartAssessmentResponse>('/risk/assessment/start', request)
      .pipe(catchError(() => this.mockStartAssessment(request)));
  }

  /**
   * Get the next clarifying question (Step 2)
   */
  getNextQuestion(sessionId: string): Observable<GetNextQuestionResponse> {
    if (USE_MOCKS) {
      return this.mockGetNextQuestion(sessionId);
    }
    return this.api.post<GetNextQuestionResponse>('/risk/assessment/next-question', { sessionId })
      .pipe(catchError(() => this.mockGetNextQuestion(sessionId)));
  }

  /**
   * Submit an answer to a question
   */
  submitAnswer(request: SubmitAnswerRequest): Observable<SubmitAnswerResponse> {
    if (USE_MOCKS) {
      return this.mockSubmitAnswer(request);
    }
    return this.api.post<SubmitAnswerResponse>('/risk/assessment/submit-answer', request)
      .pipe(catchError(() => this.mockSubmitAnswer(request)));
  }

  /**
   * Skip a question
   */
  skipQuestion(sessionId: string, questionId: string): Observable<SubmitAnswerResponse> {
    const request: SubmitAnswerRequest = {
      sessionId,
      questionId,
      answer: '',
      skipped: true
    };
    if (USE_MOCKS) {
      return this.mockSubmitAnswer(request);
    }
    return this.api.post<SubmitAnswerResponse>('/risk/assessment/skip-question', request)
      .pipe(catchError(() => this.mockSubmitAnswer(request)));
  }

  /**
   * Get the final assessment (Step 3)
   */
  getAssessment(sessionId: string): Observable<AssessmentResult> {
    if (USE_MOCKS) {
      return this.mockGetAssessment(sessionId);
    }
    return this.api.get<AssessmentResult>(`/risk/assessment/${sessionId}`)
      .pipe(catchError(() => this.mockGetAssessment(sessionId)));
  }

  /**
   * Generate improvement roadmap (Step 4)
   */
  generateRoadmap(request: GenerateRoadmapRequest): Observable<RoadmapResponse> {
    if (USE_MOCKS) {
      return this.mockGenerateRoadmap(request);
    }
    return this.api.post<RoadmapResponse>('/risk/assessment/roadmap', request)
      .pipe(catchError(() => this.mockGenerateRoadmap(request)));
  }

  // ============ MOCK IMPLEMENTATIONS ============

  private mockStartAssessment(request: StartAssessmentRequest): Observable<StartAssessmentResponse> {
    this.mockSessionId = 'mock-session-' + Date.now();
    this.mockQuestionIndex = 0;
    this.mockSkippedCount = 0;
    this.mockAnswers.clear();

    return of<StartAssessmentResponse>({
      sessionId: this.mockSessionId,
      message: 'Assessment started successfully'
    }).pipe(delay(800));
  }

  private mockGetNextQuestion(sessionId: string): Observable<GetNextQuestionResponse> {
    const questions = [
      {
        id: 'q1',
        type: QuestionType.TEXT,
        text: 'Can you describe a recent technical challenge you faced and how you approached solving it?',
        title: 'Technical Problem-Solving',
        placeholder: 'Describe the challenge, your approach, and the outcome...',
        required: true
      },
      {
        id: 'q2',
        type: QuestionType.TEXT,
        text: 'How do you typically stay updated with new technologies and industry trends in your stack?',
        title: 'Continuous Learning',
        placeholder: 'Share your learning strategies and recent skill acquisitions...',
        required: true
      },
      {
        id: 'q3',
        type: QuestionType.TEXT,
        text: 'Describe your experience collaborating with cross-functional teams. What communication practices work best for you?',
        title: 'Team Collaboration',
        placeholder: 'Discuss team dynamics, communication methods, and collaboration outcomes...',
        required: true
      }
    ];

    if (this.mockQuestionIndex >= 3) {
      return throwError(() => new Error('No more questions'));
    }

    const question = questions[this.mockQuestionIndex];
    return of<GetNextQuestionResponse>({
      sessionId,
      question,
      index: this.mockQuestionIndex + 1,
      total: 3
    }).pipe(delay(600));
  }

  private mockSubmitAnswer(request: SubmitAnswerRequest): Observable<SubmitAnswerResponse> {
    if (request.skipped) {
      this.mockSkippedCount++;
    } else {
      this.mockAnswers.set(request.questionId, request.answer);
    }

    this.mockQuestionIndex++;

    const confidenceImpact = request.skipped ? -8 : 0;

    return of<SubmitAnswerResponse>({
      sessionId: request.sessionId,
      success: true,
      confidenceImpact
    }).pipe(delay(500));
  }

  private mockGetAssessment(sessionId: string): Observable<AssessmentResult> {
    // Calculate confidence based on skipped questions
    const baseConfidence = 85;
    const confidence = Math.max(60, baseConfidence - (this.mockSkippedCount * 8));

    // Generate realistic risk score (higher risk for more skipped questions)
    const riskPercent = 35 + (this.mockSkippedCount * 5) + Math.floor(Math.random() * 10);

    let riskBand: RiskLevel;
    if (riskPercent < 30) {
      riskBand = RiskLevel.LOW;
    } else if (riskPercent < 60) {
      riskBand = RiskLevel.MEDIUM;
    } else {
      riskBand = RiskLevel.HIGH;
    }

    const result: AssessmentResult = {
      riskPercent,
      riskBand,
      confidence,
      weaknesses: [
        {
          title: 'Limited System Design Experience',
          description: 'Your profile suggests gaps in large-scale distributed systems architecture. Consider deepening knowledge in microservices patterns, caching strategies, and database scaling.',
          severity: 'high'
        },
        {
          title: 'Emerging Technology Adoption',
          description: 'While you have solid fundamentals, exposure to modern cloud-native technologies (Kubernetes, serverless) appears limited. This may impact competitiveness for senior roles.',
          severity: 'medium'
        },
        {
          title: 'Cross-functional Leadership',
          description: 'Evidence of technical leadership is present, but demonstrated experience influencing product/business decisions is unclear. Strengthening this area can unlock staff+ opportunities.',
          severity: 'medium'
        }
      ],
      signals: [
        {
          key: 'technical_depth',
          label: 'Technical Depth',
          score: 72,
          confidence: 85,
          level: RiskLevel.MEDIUM,
          description: 'Strong fundamentals with room for advanced architecture expertise'
        },
        {
          key: 'learning_velocity',
          label: 'Learning Velocity',
          score: confidence > 75 ? 65 : 55,
          confidence: confidence,
          level: confidence > 75 ? RiskLevel.MEDIUM : RiskLevel.HIGH,
          description: 'Demonstrates active learning but may benefit from more structured upskilling'
        },
        {
          key: 'market_fit',
          label: 'Market Competitiveness',
          score: 68,
          confidence: 78,
          level: RiskLevel.MEDIUM,
          description: 'Competitive for mid-level roles; needs strategic growth for senior positions'
        }
      ]
    };

    return of(result).pipe(delay(1200));
  }

  private mockGenerateRoadmap(request: GenerateRoadmapRequest): Observable<RoadmapResponse> {
    let items;
    let summary;

    if (request.duration === RoadmapDuration.SEVEN_DAYS) {
      summary = 'A focused 7-day sprint to address immediate skill gaps and build momentum for continuous improvement.';
      items = [
        {
          id: 'day1',
          day: 1,
          title: 'Foundation Assessment',
          description: 'Audit current skills and identify critical gaps',
          tasks: [
            'Complete a self-assessment of system design knowledge',
            'Review job descriptions for target roles',
            'Identify top 3 priority areas'
          ],
          checkpoints: [
            {
              id: 'cp1-1',
              title: 'Skills audit completed',
              description: 'Documented current competencies vs. target requirements',
              completed: false
            }
          ]
        },
        {
          id: 'day2',
          day: 2,
          title: 'System Design Basics',
          description: 'Introduction to distributed systems concepts',
          tasks: [
            'Watch "System Design Interview" course (Module 1-2)',
            'Read: Designing Data-Intensive Applications (Chapter 1)',
            'Sketch a simple load balancer architecture'
          ],
          checkpoints: [
            {
              id: 'cp2-1',
              title: 'Complete Module 1-2',
              description: 'Understand CAP theorem and basic scaling patterns',
              completed: false
            }
          ]
        },
        {
          id: 'day3',
          day: 3,
          title: 'Hands-on: Caching Layer',
          description: 'Build a practical caching implementation',
          tasks: [
            'Implement Redis caching in a sample project',
            'Experiment with cache invalidation strategies',
            'Document learnings in a technical blog post'
          ],
          checkpoints: [
            {
              id: 'cp3-1',
              title: 'Working cache implementation',
              description: 'Deployed and tested caching layer with metrics',
              completed: false
            }
          ]
        },
        {
          id: 'day4',
          day: 4,
          title: 'Cloud-Native Fundamentals',
          description: 'Introduction to containerization',
          tasks: [
            'Complete Docker essentials tutorial',
            'Containerize an existing application',
            'Push image to Docker Hub'
          ],
          checkpoints: [
            {
              id: 'cp4-1',
              title: 'Application containerized',
              description: 'Dockerfile created with best practices',
              completed: false
            }
          ]
        },
        {
          id: 'day5',
          day: 5,
          title: 'Database Scaling',
          description: 'Explore replication and sharding concepts',
          tasks: [
            'Study database replication patterns (master-slave, multi-master)',
            'Set up a simple replicated database',
            'Benchmark read/write performance'
          ],
          checkpoints: [
            {
              id: 'cp5-1',
              title: 'Replication setup complete',
              description: 'Working replica set with performance metrics',
              completed: false
            }
          ]
        },
        {
          id: 'day6',
          day: 6,
          title: 'Communication Skills',
          description: 'Practice explaining technical concepts',
          tasks: [
            'Record a 5-minute explanation of your caching implementation',
            'Share technical blog post with peers for feedback',
            'Join a system design discussion group'
          ],
          checkpoints: [
            {
              id: 'cp6-1',
              title: 'Technical presentation delivered',
              description: 'Clear explanation with visual aids',
              completed: false
            }
          ]
        },
        {
          id: 'day7',
          day: 7,
          title: 'Integration & Reflection',
          description: 'Consolidate learnings and plan next steps',
          tasks: [
            'Build a mini-project combining all concepts (cache + containers + DB)',
            'Update resume with new skills',
            'Create a 30-day learning roadmap'
          ],
          checkpoints: [
            {
              id: 'cp7-1',
              title: 'Integration project complete',
              description: 'Deployed application demonstrating new skills',
              completed: false
            },
            {
              id: 'cp7-2',
              title: '30-day plan documented',
              description: 'Clear objectives and milestones defined',
              completed: false
            }
          ]
        }
      ];
    } else if (request.duration === RoadmapDuration.THIRTY_DAYS) {
      summary = 'A comprehensive 30-day program to build production-grade skills in system design and cloud technologies.';
      items = [
        {
          id: 'week1',
          week: 1,
          title: 'System Design Foundations',
          description: 'Core distributed systems concepts',
          tasks: [
            'Complete system design fundamentals course',
            'Read: Designing Data-Intensive Applications (Chapters 1-4)',
            'Practice: Design a URL shortener service',
            'Build: Implement a simple load balancer'
          ],
          checkpoints: [
            {
              id: 'cpw1-1',
              title: 'Design document: URL shortener',
              description: 'Complete architecture with tradeoff analysis',
              completed: false
            },
            {
              id: 'cpw1-2',
              title: 'Working load balancer',
              description: 'Round-robin implementation with health checks',
              completed: false
            }
          ]
        },
        {
          id: 'week2',
          week: 2,
          title: 'Caching & Database Optimization',
          description: 'Advanced data layer strategies',
          tasks: [
            'Implement multi-tier caching (Redis + in-memory)',
            'Study database indexing and query optimization',
            'Practice: Design an Instagram-like feed',
            'Benchmark: Compare caching strategies'
          ],
          checkpoints: [
            {
              id: 'cpw2-1',
              title: 'Production-grade cache implementation',
              description: 'With eviction policies and monitoring',
              completed: false
            },
            {
              id: 'cpw2-2',
              title: 'Feed design document',
              description: 'Addressing hotkey and thundering herd problems',
              completed: false
            }
          ]
        },
        {
          id: 'week3',
          week: 3,
          title: 'Cloud-Native Architecture',
          description: 'Kubernetes and microservices',
          tasks: [
            'Complete Kubernetes fundamentals course',
            'Deploy a microservices app to k8s cluster',
            'Implement service mesh (Istio basics)',
            'Practice: Design a ride-sharing system'
          ],
          checkpoints: [
            {
              id: 'cpw3-1',
              title: 'Microservices deployed on k8s',
              description: 'With auto-scaling and service discovery',
              completed: false
            },
            {
              id: 'cpw3-2',
              title: 'Ride-sharing design doc',
              description: 'Geospatial indexing and real-time matching',
              completed: false
            }
          ]
        },
        {
          id: 'week4',
          week: 4,
          title: 'Leadership & Integration',
          description: 'Communication and project showcase',
          tasks: [
            'Write technical blog: "Scaling from 0 to 1M users"',
            'Present a system design mock interview',
            'Build capstone: Full-stack app with all concepts',
            'Update portfolio with detailed case studies'
          ],
          checkpoints: [
            {
              id: 'cpw4-1',
              title: 'Blog published',
              description: 'Shared on LinkedIn with engagement metrics',
              completed: false
            },
            {
              id: 'cpw4-2',
              title: 'Capstone project deployed',
              description: 'Live demo with architecture documentation',
              completed: false
            },
            {
              id: 'cpw4-3',
              title: 'Mock interview passed',
              description: 'Positive feedback on communication clarity',
              completed: false
            }
          ]
        }
      ];
    } else {
      // 90 days
      summary = 'A transformative 90-day journey to achieve staff+ engineer competencies with production experience and thought leadership.';
      items = [
        {
          id: 'week1-4',
          week: 1,
          title: 'Weeks 1-4: System Design Mastery',
          description: 'Deep dive into distributed systems',
          tasks: [
            'Complete advanced system design course (Grokking the System Design Interview)',
            'Read: Designing Data-Intensive Applications (full book)',
            'Practice 12 classic system design problems',
            'Build: Multi-region distributed cache with consistency guarantees'
          ],
          checkpoints: [
            {
              id: 'cp90-1',
              title: 'Design portfolio: 12 problems',
              description: 'Documented on GitHub with diagrams',
              completed: false
            },
            {
              id: 'cp90-2',
              title: 'Multi-region cache deployed',
              description: 'With conflict resolution and monitoring',
              completed: false
            }
          ]
        },
        {
          id: 'week5-8',
          week: 5,
          title: 'Weeks 5-8: Cloud & Orchestration',
          description: 'Production-grade infrastructure',
          tasks: [
            'AWS Solutions Architect Associate certification',
            'Kubernetes CKA certification prep',
            'Build: Microservices platform with full observability',
            'Implement: CI/CD pipeline with GitOps (ArgoCD)'
          ],
          checkpoints: [
            {
              id: 'cp90-3',
              title: 'AWS certification achieved',
              description: 'Solutions Architect Associate credential',
              completed: false
            },
            {
              id: 'cp90-4',
              title: 'Production k8s platform',
              description: 'With Prometheus, Grafana, and alerting',
              completed: false
            }
          ]
        },
        {
          id: 'week9-12',
          week: 9,
          title: 'Weeks 9-12: Advanced Patterns',
          description: 'Event-driven and reactive systems',
          tasks: [
            'Study: Event sourcing and CQRS patterns',
            'Implement: Event-driven microservices with Kafka',
            'Build: Real-time analytics pipeline',
            'Practice: High-level design for Uber, Netflix, WhatsApp'
          ],
          checkpoints: [
            {
              id: 'cp90-5',
              title: 'Event-driven system deployed',
              description: 'With saga pattern for distributed transactions',
              completed: false
            },
            {
              id: 'cp90-6',
              title: 'Analytics pipeline operational',
              description: 'Real-time dashboards with <1s latency',
              completed: false
            }
          ]
        },
        {
          id: 'week13',
          week: 13,
          title: 'Weeks 13+: Thought Leadership',
          description: 'Establish technical authority',
          tasks: [
            'Publish 6 in-depth technical blog posts',
            'Speak at a local tech meetup or conference',
            'Contribute to open-source infrastructure projects',
            'Launch: Personal website with case studies and talks',
            'Network: Connect with 20 senior engineers on LinkedIn'
          ],
          checkpoints: [
            {
              id: 'cp90-7',
              title: 'Content portfolio live',
              description: '6 blog posts with 1000+ total views',
              completed: false
            },
            {
              id: 'cp90-8',
              title: 'Public speaking debut',
              description: 'Conference/meetup talk delivered',
              completed: false
            },
            {
              id: 'cp90-9',
              title: 'OSS contributions merged',
              description: '3+ meaningful PRs to established projects',
              completed: false
            },
            {
              id: 'cp90-10',
              title: 'Professional network expanded',
              description: '20 meaningful connections with engagement',
              completed: false
            }
          ]
        }
      ];
    }

    return of<RoadmapResponse>({
      sessionId: request.sessionId,
      duration: request.duration,
      items,
      summary
    }).pipe(delay(1500));
  }
}
