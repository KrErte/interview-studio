import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiModeService } from '../../../core/services/ui-mode.service';

interface ChatMessage {
  sender: 'recruiter' | 'you';
  text: string;
}

@Component({
  selector: 'app-salary-negotiation-dojo-simple',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="simple-container">
      @if (!started()) {
        <!-- Intro Screen -->
        <div class="intro-screen">
          <div class="intro-content">
            <span class="icon">💰</span>
            <h1>Salary Negotiation Practice</h1>
            <p>Practice negotiating a job offer in a safe environment. No judgment, just learning.</p>

            <div class="scenario-preview">
              <h3>The Scenario</h3>
              <p>You just received an offer for <strong>{{ initialOffer | currency:'USD':'symbol':'1.0-0' }}</strong></p>
              <p class="market-hint">Market rate for this role: {{ marketMin | currency:'USD':'symbol':'1.0-0' }} - {{ marketMax | currency:'USD':'symbol':'1.0-0' }}</p>
            </div>

            <div class="tips-preview">
              <div class="tip">
                <span class="tip-icon">1</span>
                <span>Express enthusiasm first</span>
              </div>
              <div class="tip">
                <span class="tip-icon">2</span>
                <span>Use market data to justify your ask</span>
              </div>
              <div class="tip">
                <span class="tip-icon">3</span>
                <span>Know your walk-away number</span>
              </div>
            </div>

            <button class="btn-start" (click)="start()">
              Start Practice →
            </button>
          </div>
        </div>
      } @else if (!finished()) {
        <!-- Chat Interface -->
        <div class="chat-screen">
          <div class="chat-header">
            <div class="recruiter-badge">
              <span class="avatar">👔</span>
              <div>
                <span class="name">Alex (Recruiter)</span>
                <span class="status">Typing...</span>
              </div>
            </div>
            <div class="offer-display">
              <span class="label">Current Offer</span>
              <span class="amount">{{ currentOffer | currency:'USD':'symbol':'1.0-0' }}</span>
            </div>
          </div>

          <div class="chat-messages">
            @for (msg of messages(); track $index) {
              <div class="message" [class.recruiter]="msg.sender === 'recruiter'" [class.you]="msg.sender === 'you'">
                {{ msg.text }}
              </div>
            }
          </div>

          <div class="response-area">
            @if (awaitingResponse()) {
              <div class="response-options">
                @for (option of currentOptions(); track option.id) {
                  <button
                    class="option-btn"
                    [attr.data-type]="option.type"
                    (click)="selectOption(option)"
                  >
                    {{ option.text }}
                  </button>
                }
              </div>
            } @else {
              <div class="waiting">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </div>
            }
          </div>
        </div>
      } @else {
        <!-- Results Screen -->
        <div class="results-screen">
          <div class="result-card" [attr.data-outcome]="outcome()">
            @if (outcome() === 'great') {
              <span class="result-icon">🎉</span>
              <h2>Excellent negotiation!</h2>
              <p>Final: <strong>{{ currentOffer | currency:'USD':'symbol':'1.0-0' }}</strong></p>
              <p class="result-detail">You negotiated {{ getIncrease() | currency:'USD':'symbol':'1.0-0' }} above the initial offer!</p>
            } @else if (outcome() === 'good') {
              <span class="result-icon">👍</span>
              <h2>Good outcome</h2>
              <p>Final: <strong>{{ currentOffer | currency:'USD':'symbol':'1.0-0' }}</strong></p>
              <p class="result-detail">You improved the offer. There may have been more room, but solid result.</p>
            } @else if (outcome() === 'accepted-low') {
              <span class="result-icon">😐</span>
              <h2>Accepted, but...</h2>
              <p>Final: <strong>{{ currentOffer | currency:'USD':'symbol':'1.0-0' }}</strong></p>
              <p class="result-detail">You accepted below market rate. The company had budget up to {{ companyMax | currency:'USD':'symbol':'1.0-0' }}.</p>
            } @else {
              <span class="result-icon">🚪</span>
              <h2>They walked away</h2>
              <p class="result-detail">You pushed too hard too fast. Their max was {{ companyMax | currency:'USD':'symbol':'1.0-0' }}.</p>
            }
          </div>

          <div class="lessons">
            <h3>Key lessons</h3>
            @for (lesson of lessons(); track lesson) {
              <div class="lesson-item">{{ lesson }}</div>
            }
          </div>

          <div class="actions">
            <button class="btn-retry" (click)="reset()">Try again</button>
            <button class="btn-advanced" (click)="switchToAdvanced()">
              Try advanced scenarios →
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .simple-container {
      min-height: 100vh;
      background: linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%);
      padding: 2rem;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }

    /* Intro Screen */
    .intro-screen {
      max-width: 500px;
      width: 100%;
    }

    .intro-content {
      text-align: center;
    }

    .intro-content .icon {
      font-size: 4rem;
      display: block;
      margin-bottom: 1rem;
    }

    .intro-content h1 {
      font-size: 2rem;
      color: #f1f5f9;
      margin-bottom: 0.75rem;
    }

    .intro-content > p {
      color: #64748b;
      margin-bottom: 2rem;
    }

    .scenario-preview {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
      text-align: left;
    }

    .scenario-preview h3 {
      color: #10b981;
      font-size: 0.875rem;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }

    .scenario-preview p {
      color: #e2e8f0;
      font-size: 1.1rem;
    }

    .scenario-preview strong {
      color: #10b981;
      font-size: 1.25rem;
    }

    .market-hint {
      font-size: 0.9rem !important;
      color: #64748b !important;
      margin-top: 0.5rem;
    }

    .tips-preview {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 2rem;
    }

    .tip {
      display: flex;
      align-items: center;
      gap: 1rem;
      text-align: left;
      color: #94a3b8;
    }

    .tip-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(139, 92, 246, 0.2);
      color: #c4b5fd;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      font-weight: 600;
      flex-shrink: 0;
    }

    .btn-start {
      width: 100%;
      background: linear-gradient(135deg, #10b981, #059669);
      border: none;
      padding: 1.125rem;
      border-radius: 10px;
      color: white;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-start:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
    }

    /* Chat Screen */
    .chat-screen {
      max-width: 600px;
      width: 100%;
      display: flex;
      flex-direction: column;
      height: calc(100vh - 4rem);
    }

    .chat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: rgba(255,255,255,0.03);
      border-radius: 12px 12px 0 0;
      border: 1px solid rgba(255,255,255,0.1);
      border-bottom: none;
    }

    .recruiter-badge {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .avatar {
      font-size: 2rem;
    }

    .recruiter-badge .name {
      display: block;
      color: #f1f5f9;
      font-weight: 500;
    }

    .recruiter-badge .status {
      font-size: 0.75rem;
      color: #64748b;
    }

    .offer-display {
      text-align: right;
    }

    .offer-display .label {
      display: block;
      font-size: 0.7rem;
      color: #64748b;
      text-transform: uppercase;
    }

    .offer-display .amount {
      color: #10b981;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.1);
      border-top: none;
      border-bottom: none;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .message {
      max-width: 80%;
      padding: 1rem 1.25rem;
      border-radius: 16px;
      line-height: 1.5;
    }

    .message.recruiter {
      align-self: flex-start;
      background: rgba(255,255,255,0.1);
      color: #e2e8f0;
      border-bottom-left-radius: 4px;
    }

    .message.you {
      align-self: flex-end;
      background: #10b981;
      color: white;
      border-bottom-right-radius: 4px;
    }

    .response-area {
      padding: 1rem;
      background: rgba(255,255,255,0.03);
      border-radius: 0 0 12px 12px;
      border: 1px solid rgba(255,255,255,0.1);
      border-top: none;
    }

    .response-options {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .option-btn {
      width: 100%;
      background: rgba(255,255,255,0.05);
      border: 2px solid rgba(255,255,255,0.1);
      padding: 1rem;
      border-radius: 10px;
      color: #e2e8f0;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }

    .option-btn:hover {
      border-color: #10b981;
      background: rgba(16, 185, 129, 0.1);
    }

    .option-btn[data-type="accept"] {
      border-color: rgba(16, 185, 129, 0.3);
    }

    .option-btn[data-type="counter"] {
      border-color: rgba(245, 158, 11, 0.3);
    }

    .option-btn[data-type="push"] {
      border-color: rgba(239, 68, 68, 0.3);
    }

    .waiting {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem;
    }

    .dot {
      width: 10px;
      height: 10px;
      background: #64748b;
      border-radius: 50%;
      animation: bounce 1.4s infinite;
    }

    .dot:nth-child(2) { animation-delay: 0.2s; }
    .dot:nth-child(3) { animation-delay: 0.4s; }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); opacity: 0.5; }
      50% { transform: translateY(-8px); opacity: 1; }
    }

    /* Results Screen */
    .results-screen {
      max-width: 500px;
      width: 100%;
    }

    .result-card {
      text-align: center;
      padding: 2rem;
      border-radius: 16px;
      margin-bottom: 2rem;
    }

    .result-card[data-outcome="great"] {
      background: rgba(16, 185, 129, 0.15);
      border: 2px solid rgba(16, 185, 129, 0.4);
    }

    .result-card[data-outcome="good"] {
      background: rgba(59, 130, 246, 0.15);
      border: 2px solid rgba(59, 130, 246, 0.4);
    }

    .result-card[data-outcome="accepted-low"] {
      background: rgba(245, 158, 11, 0.15);
      border: 2px solid rgba(245, 158, 11, 0.4);
    }

    .result-card[data-outcome="rejected"] {
      background: rgba(239, 68, 68, 0.15);
      border: 2px solid rgba(239, 68, 68, 0.4);
    }

    .result-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 1rem;
    }

    .result-card h2 {
      color: #f1f5f9;
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .result-card p {
      color: #e2e8f0;
    }

    .result-card strong {
      font-size: 1.5rem;
      color: #10b981;
    }

    .result-detail {
      color: #94a3b8 !important;
      font-size: 0.95rem;
      margin-top: 0.5rem;
    }

    .lessons {
      margin-bottom: 2rem;
    }

    .lessons h3 {
      color: #f1f5f9;
      font-size: 1rem;
      margin-bottom: 1rem;
    }

    .lesson-item {
      background: rgba(139, 92, 246, 0.1);
      border-left: 3px solid #8b5cf6;
      padding: 0.875rem 1rem;
      margin-bottom: 0.5rem;
      border-radius: 0 8px 8px 0;
      color: #e2e8f0;
      font-size: 0.95rem;
    }

    .actions {
      display: flex;
      gap: 1rem;
    }

    .btn-retry, .btn-advanced {
      flex: 1;
      padding: 1rem;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-retry {
      background: transparent;
      border: 2px solid rgba(255,255,255,0.2);
      color: #e2e8f0;
    }

    .btn-advanced {
      background: #8b5cf6;
      border: none;
      color: white;
    }
  `]
})
export class SalaryNegotiationDojoSimpleComponent {
  private uiMode = inject(UiModeService);

  // Scenario values
  initialOffer = 140000;
  marketMin = 145000;
  marketMax = 175000;
  companyMax = 165000;
  currentOffer = 140000;

  started = signal(false);
  finished = signal(false);
  messages = signal<ChatMessage[]>([]);
  awaitingResponse = signal(false);
  round = signal(1);
  outcome = signal<'great' | 'good' | 'accepted-low' | 'rejected'>('good');

  currentOptions = signal<Array<{
    id: string;
    text: string;
    type: 'accept' | 'counter' | 'push';
    action: () => void
  }>>([]);

  start() {
    this.started.set(true);
    this.addMessage('recruiter', `Great news! We'd like to offer you the position with a base salary of $${this.initialOffer.toLocaleString()}. How does that sound?`);

    setTimeout(() => {
      this.showOptions();
    }, 1000);
  }

  showOptions() {
    const round = this.round();

    if (round === 1) {
      this.currentOptions.set([
        {
          id: 'accept-1',
          text: 'That sounds great, I accept!',
          type: 'accept',
          action: () => this.accept()
        },
        {
          id: 'counter-1',
          text: `I'm excited about the role! Based on market rates, I was hoping for $${(this.initialOffer + 15000).toLocaleString()}.`,
          type: 'counter',
          action: () => this.counter(15000)
        },
        {
          id: 'push-1',
          text: `I'd need at least $${this.marketMax.toLocaleString()} to make this work.`,
          type: 'push',
          action: () => this.counter(35000)
        }
      ]);
    } else if (round === 2) {
      this.currentOptions.set([
        {
          id: 'accept-2',
          text: 'That works for me. Let\'s do it!',
          type: 'accept',
          action: () => this.accept()
        },
        {
          id: 'counter-2',
          text: `Can we meet in the middle at $${(Math.round((this.currentOffer + this.companyMax) / 2 / 1000) * 1000).toLocaleString()}?`,
          type: 'counter',
          action: () => this.counter(10000)
        },
        {
          id: 'push-2',
          text: 'I appreciate it, but I really need more to make this work.',
          type: 'push',
          action: () => this.pushHard()
        }
      ]);
    } else {
      this.currentOptions.set([
        {
          id: 'accept-3',
          text: 'I\'ll take it. Thank you!',
          type: 'accept',
          action: () => this.accept()
        },
        {
          id: 'walk-3',
          text: 'I think I need to decline. It\'s not quite where I need to be.',
          type: 'push',
          action: () => this.walkAway()
        }
      ]);
    }

    this.awaitingResponse.set(true);
  }

  selectOption(option: { action: () => void }) {
    this.awaitingResponse.set(false);
    option.action();
  }

  addMessage(sender: 'recruiter' | 'you', text: string) {
    this.messages.update(msgs => [...msgs, { sender, text }]);
  }

  accept() {
    this.addMessage('you', `I accept! $${this.currentOffer.toLocaleString()} works for me.`);

    setTimeout(() => {
      this.addMessage('recruiter', 'Wonderful! Welcome to the team. We\'ll send over the paperwork shortly.');

      // Determine outcome
      if (this.currentOffer >= this.companyMax) {
        this.outcome.set('great');
      } else if (this.currentOffer >= this.marketMin) {
        this.outcome.set('good');
      } else {
        this.outcome.set('accepted-low');
      }

      this.finished.set(true);
    }, 1000);
  }

  counter(amount: number) {
    const askAmount = this.currentOffer + amount;
    this.addMessage('you', `I'm very excited about this opportunity. Based on my experience and market rates, I was hoping for something closer to $${askAmount.toLocaleString()}.`);

    setTimeout(() => {
      if (askAmount <= this.companyMax) {
        // They can afford it
        const newOffer = Math.min(askAmount, this.companyMax);
        this.currentOffer = newOffer;
        this.addMessage('recruiter', `I understand. Let me see what I can do... I can get you to $${newOffer.toLocaleString()}. That's our best offer.`);
      } else {
        // Above budget but not crazy
        const counterOffer = this.currentOffer + Math.round(amount * 0.5);
        this.currentOffer = Math.min(counterOffer, this.companyMax);
        this.addMessage('recruiter', `That's a bit higher than we planned, but I can go up to $${this.currentOffer.toLocaleString()}. Can you work with that?`);
      }

      this.round.update(r => r + 1);
      setTimeout(() => this.showOptions(), 500);
    }, 1500);
  }

  pushHard() {
    this.addMessage('you', 'I really appreciate the offer, but I need to see more movement on the base salary to make this work.');

    setTimeout(() => {
      if (this.round() >= 3 || this.currentOffer >= this.companyMax - 5000) {
        this.addMessage('recruiter', 'I understand, but we\'ve reached our limit. I\'m afraid we\'ll need to move on to other candidates.');
        this.outcome.set('rejected');
        this.finished.set(true);
      } else {
        const smallBump = 3000;
        this.currentOffer += smallBump;
        this.addMessage('recruiter', `I really want to make this work. The absolute best I can do is $${this.currentOffer.toLocaleString()}. This is truly our maximum.`);
        this.round.update(r => r + 1);
        setTimeout(() => this.showOptions(), 500);
      }
    }, 1500);
  }

  walkAway() {
    this.addMessage('you', 'I appreciate the offer, but I\'ll have to decline. The compensation doesn\'t meet my requirements.');

    setTimeout(() => {
      this.addMessage('recruiter', 'I understand. Best of luck with your search.');
      this.outcome.set('rejected');
      this.finished.set(true);
    }, 1000);
  }

  getIncrease(): number {
    return this.currentOffer - this.initialOffer;
  }

  lessons = signal<string[]>([]);

  ngOnInit() {
    // Set up lessons based on outcome when finished
  }

  switchToAdvanced() {
    this.uiMode.setMode('advanced');
  }

  reset() {
    this.started.set(false);
    this.finished.set(false);
    this.messages.set([]);
    this.currentOffer = this.initialOffer;
    this.round.set(1);
    this.awaitingResponse.set(false);
  }
}
