import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface NegotiationScenario {
  id: string;
  title: string;
  description: string;
  initialOffer: number;
  marketRate: { min: number; max: number };
  companyBudget: number; // Hidden from user
  difficulty: number;
  recruiterStyle: 'hardball' | 'friendly' | 'budget-constrained' | 'desperate';
}

interface Message {
  id: string;
  sender: 'recruiter' | 'you';
  text: string;
  timestamp: number;
  innerThought?: string; // What recruiter is really thinking
  leverage?: number; // -100 to 100, positive = you have leverage
}

interface NegotiationState {
  currentOffer: number;
  yourAsk: number;
  round: number;
  recruiterPatience: number;
  yourLeverage: number;
  dealStatus: 'negotiating' | 'accepted' | 'rejected' | 'walked';
}

@Component({
  selector: 'app-salary-negotiation-dojo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dojo-container">
      <div class="header">
        <div class="header-content">
          <h1>💰 Salary Negotiation Dojo</h1>
          <p>Learn the hidden rules. See what they won't tell you.</p>
        </div>
      </div>

      @if (!activeScenario()) {
        <!-- Scenario Selection -->
        <div class="scenario-selection">
          <h2>Choose Your Challenge</h2>

          <div class="scenarios-grid">
            @for (scenario of scenarios; track scenario.id) {
              <div class="scenario-card" (click)="selectScenario(scenario)">
                <div class="scenario-header">
                  <span class="scenario-style" [attr.data-style]="scenario.recruiterStyle">
                    {{ getStyleEmoji(scenario.recruiterStyle) }}
                  </span>
                  <div class="difficulty-pips">
                    @for (i of [1,2,3,4,5]; track i) {
                      <span class="pip" [class.filled]="i <= scenario.difficulty"></span>
                    }
                  </div>
                </div>
                <h3>{{ scenario.title }}</h3>
                <p>{{ scenario.description }}</p>
                <div class="scenario-details">
                  <div class="detail">
                    <span class="label">Initial Offer</span>
                    <span class="value">\${{ scenario.initialOffer | number }}</span>
                  </div>
                  <div class="detail">
                    <span class="label">Market Rate</span>
                    <span class="value">\${{ scenario.marketRate.min | number }} - \${{ scenario.marketRate.max | number }}</span>
                  </div>
                </div>
                <div class="scenario-badge" [attr.data-style]="scenario.recruiterStyle">
                  {{ scenario.recruiterStyle | titlecase }} Recruiter
                </div>
              </div>
            }
          </div>

          <!-- Knowledge Section -->
          <div class="knowledge-section">
            <h3>🧠 Negotiation Secrets They Don't Want You to Know</h3>
            <div class="secrets-grid">
              <div class="secret-card">
                <span class="secret-number">01</span>
                <h4>The First Number Anchors Everything</h4>
                <p>Whoever says a number first sets the anchor. Make them go first when possible, but if you must - aim high.</p>
              </div>
              <div class="secret-card">
                <span class="secret-number">02</span>
                <h4>Budget vs. Authority</h4>
                <p>Recruiters often have more budget than authority. "I'll need to check" often means "I need permission to say yes."</p>
              </div>
              <div class="secret-card">
                <span class="secret-number">03</span>
                <h4>The Walk-Away Point</h4>
                <p>Know your minimum before starting. Desperation shows. The person who can walk away has the power.</p>
              </div>
              <div class="secret-card">
                <span class="secret-number">04</span>
                <h4>Total Compensation Math</h4>
                <p>Salary, equity, bonus, benefits, signing bonus. A \$10K lower salary with \$50K more equity over 4 years is better.</p>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <!-- Active Negotiation -->
        <div class="negotiation-active">
          <div class="negotiation-layout">
            <!-- Left: Chat -->
            <div class="chat-panel">
              <div class="chat-header">
                <div class="recruiter-info">
                  <span class="recruiter-avatar">{{ getStyleEmoji(activeScenario()!.recruiterStyle) }}</span>
                  <div>
                    <h3>{{ getRecruiterName() }}</h3>
                    <span class="recruiter-title">Senior Recruiter, TechCorp</span>
                  </div>
                </div>
                <div class="patience-meter">
                  <span class="label">Their Patience</span>
                  <div class="patience-bar">
                    <div class="fill" [style.width.%]="state().recruiterPatience" [attr.data-level]="getPatienceLevel()"></div>
                  </div>
                </div>
              </div>

              <div class="messages-container">
                @for (msg of messages(); track msg.id) {
                  <div class="message" [class.recruiter]="msg.sender === 'recruiter'" [class.you]="msg.sender === 'you'">
                    <div class="message-content">
                      <p>{{ msg.text }}</p>
                    </div>
                    @if (msg.innerThought && showThoughts()) {
                      <div class="inner-thought">
                        <span class="thought-icon">💭</span>
                        <span class="thought-text">{{ msg.innerThought }}</span>
                      </div>
                    }
                    @if (msg.leverage !== undefined) {
                      <div class="leverage-indicator" [attr.data-direction]="msg.leverage > 0 ? 'up' : 'down'">
                        {{ msg.leverage > 0 ? '↑' : '↓' }} Leverage {{ msg.leverage > 0 ? '+' : '' }}{{ msg.leverage }}
                      </div>
                    }
                  </div>
                }

                @if (isTyping()) {
                  <div class="message recruiter">
                    <div class="typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                }
              </div>

              <!-- Response Options -->
              @if (state().dealStatus === 'negotiating' && !isTyping()) {
                <div class="response-section">
                  <div class="response-options">
                    @for (option of currentOptions(); track option.id) {
                      <button
                        class="response-option"
                        [attr.data-risk]="option.risk"
                        (click)="selectResponse(option)"
                      >
                        <span class="option-text">{{ option.text }}</span>
                        <span class="option-risk">{{ option.risk | titlecase }} Risk</span>
                      </button>
                    }
                  </div>

                  <div class="custom-response">
                    <input
                      type="text"
                      [(ngModel)]="customResponse"
                      placeholder="Or type your own response..."
                      (keyup.enter)="sendCustomResponse()"
                    />
                    <button (click)="sendCustomResponse()" [disabled]="!customResponse.trim()">Send</button>
                  </div>
                </div>
              }

              <!-- Deal Result -->
              @if (state().dealStatus !== 'negotiating') {
                <div class="deal-result" [attr.data-status]="state().dealStatus">
                  @if (state().dealStatus === 'accepted') {
                    <div class="result-content">
                      <span class="result-emoji">🎉</span>
                      <h3>Deal Closed!</h3>
                      <p>Final offer: <strong>\${{ state().currentOffer | number }}</strong></p>
                      <p class="result-analysis">
                        @if (state().currentOffer >= activeScenario()!.marketRate.max) {
                          Exceptional! You negotiated above market rate.
                        } @else if (state().currentOffer >= activeScenario()!.marketRate.min) {
                          Good deal - you're within market rate.
                        } @else {
                          You left money on the table. Market rate was higher.
                        }
                      </p>
                    </div>
                  } @else if (state().dealStatus === 'rejected') {
                    <div class="result-content">
                      <span class="result-emoji">💔</span>
                      <h3>Offer Rescinded</h3>
                      <p>They walked away. You pushed too hard or too fast.</p>
                    </div>
                  } @else if (state().dealStatus === 'walked') {
                    <div class="result-content">
                      <span class="result-emoji">🚪</span>
                      <h3>You Walked Away</h3>
                      <p>Sometimes the best deal is no deal. Their max was \${{ activeScenario()!.companyBudget | number }}.</p>
                    </div>
                  }
                  <button class="btn-retry" (click)="resetScenario()">Try Again</button>
                  <button class="btn-new" (click)="clearScenario()">New Scenario</button>
                </div>
              }
            </div>

            <!-- Right: Intel Panel -->
            <div class="intel-panel">
              <div class="intel-section">
                <h4>📊 Deal Status</h4>
                <div class="offer-comparison">
                  <div class="offer-item">
                    <span class="label">Their Offer</span>
                    <span class="value current">\${{ state().currentOffer | number }}</span>
                  </div>
                  <div class="offer-item">
                    <span class="label">Market Rate</span>
                    <span class="value market">\${{ activeScenario()!.marketRate.min | number }} - \${{ activeScenario()!.marketRate.max | number }}</span>
                  </div>
                  <div class="offer-item hidden-intel">
                    <span class="label">Their Budget (hidden)</span>
                    <span class="value budget" [class.revealed]="showBudget()">
                      {{ showBudget() ? '$' + (activeScenario()!.companyBudget | number) : '???' }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="intel-section">
                <h4>⚡ Your Leverage</h4>
                <div class="leverage-meter">
                  <div class="meter-track">
                    <div class="meter-fill" [style.width.%]="(state().yourLeverage + 100) / 2" [attr.data-level]="getLeverageLevel()"></div>
                  </div>
                  <div class="meter-labels">
                    <span>They have power</span>
                    <span>You have power</span>
                  </div>
                </div>
              </div>

              <div class="intel-section">
                <h4>🎯 Round {{ state().round }}</h4>
                <p class="round-tip">{{ getRoundTip() }}</p>
              </div>

              <div class="intel-section toggles">
                <label class="toggle">
                  <input type="checkbox" [(ngModel)]="showThoughtsEnabled" />
                  <span>Show recruiter's thoughts</span>
                </label>
                <label class="toggle">
                  <input type="checkbox" [(ngModel)]="showBudgetEnabled" />
                  <span>Reveal hidden budget</span>
                </label>
              </div>

              <div class="intel-section tactics">
                <h4>📚 Tactics for This Situation</h4>
                @for (tactic of currentTactics(); track tactic) {
                  <div class="tactic-card">{{ tactic }}</div>
                }
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Mock Button -->
      <button class="mock-btn" (click)="loadMockScenario()" title="Quick start">
        🧪 Mock
      </button>
    </div>
  `,
  styles: [`
    .dojo-container {
      min-height: 100vh;
      background: linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%);
      padding: 2rem;
    }

    .header {
      margin-bottom: 2rem;
    }

    .header h1 {
      font-size: 2rem;
      color: #f1f5f9;
      margin-bottom: 0.5rem;
    }

    .header p {
      color: #64748b;
    }

    /* Scenario Selection */
    .scenario-selection {
      max-width: 1200px;
      margin: 0 auto;
    }

    .scenario-selection h2 {
      font-size: 1.5rem;
      color: #f1f5f9;
      text-align: center;
      margin-bottom: 2rem;
    }

    .scenarios-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .scenario-card {
      background: rgba(255,255,255,0.03);
      border: 2px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.3s;
      position: relative;
    }

    .scenario-card:hover {
      border-color: #10b981;
      transform: translateY(-4px);
    }

    .scenario-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .scenario-style {
      font-size: 2rem;
    }

    .difficulty-pips {
      display: flex;
      gap: 4px;
    }

    .pip {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255,255,255,0.1);
    }

    .pip.filled {
      background: #f59e0b;
    }

    .scenario-card h3 {
      color: #f1f5f9;
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
    }

    .scenario-card p {
      color: #94a3b8;
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }

    .scenario-details {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1rem;
    }

    .detail {
      display: flex;
      flex-direction: column;
    }

    .detail .label {
      font-size: 0.7rem;
      color: #64748b;
      text-transform: uppercase;
    }

    .detail .value {
      color: #10b981;
      font-weight: 600;
    }

    .scenario-badge {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      font-size: 0.7rem;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-weight: 600;
    }

    .scenario-badge[data-style="hardball"] { background: #ef4444; color: white; }
    .scenario-badge[data-style="friendly"] { background: #10b981; color: white; }
    .scenario-badge[data-style="budget-constrained"] { background: #f59e0b; color: black; }
    .scenario-badge[data-style="desperate"] { background: #8b5cf6; color: white; }

    /* Knowledge Section */
    .knowledge-section {
      background: rgba(255,255,255,0.02);
      border-radius: 16px;
      padding: 2rem;
    }

    .knowledge-section h3 {
      color: #f1f5f9;
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .secrets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .secret-card {
      background: rgba(139, 92, 246, 0.1);
      border-left: 3px solid #8b5cf6;
      padding: 1rem;
      border-radius: 0 8px 8px 0;
    }

    .secret-number {
      font-size: 2rem;
      font-weight: bold;
      color: rgba(139, 92, 246, 0.3);
    }

    .secret-card h4 {
      color: #f1f5f9;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .secret-card p {
      color: #94a3b8;
      font-size: 0.85rem;
      line-height: 1.5;
    }

    /* Negotiation Active */
    .negotiation-layout {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .chat-panel {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      height: calc(100vh - 200px);
    }

    .chat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .recruiter-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .recruiter-avatar {
      font-size: 2.5rem;
    }

    .recruiter-info h3 {
      color: #f1f5f9;
      font-size: 1rem;
      margin-bottom: 0.125rem;
    }

    .recruiter-title {
      color: #64748b;
      font-size: 0.75rem;
    }

    .patience-meter {
      text-align: right;
    }

    .patience-meter .label {
      font-size: 0.7rem;
      color: #64748b;
      display: block;
      margin-bottom: 0.25rem;
    }

    .patience-bar {
      width: 100px;
      height: 6px;
      background: rgba(255,255,255,0.1);
      border-radius: 3px;
      overflow: hidden;
    }

    .patience-bar .fill {
      height: 100%;
      transition: width 0.5s;
    }

    .fill[data-level="high"] { background: #10b981; }
    .fill[data-level="medium"] { background: #f59e0b; }
    .fill[data-level="low"] { background: #ef4444; }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .message {
      max-width: 80%;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .message.recruiter {
      align-self: flex-start;
    }

    .message.you {
      align-self: flex-end;
    }

    .message-content {
      padding: 1rem 1.25rem;
      border-radius: 16px;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .message.recruiter .message-content {
      background: rgba(255,255,255,0.1);
      color: #e2e8f0;
      border-bottom-left-radius: 4px;
    }

    .message.you .message-content {
      background: #10b981;
      color: white;
      border-bottom-right-radius: 4px;
    }

    .inner-thought {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      background: rgba(139, 92, 246, 0.15);
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      font-size: 0.8rem;
      font-style: italic;
    }

    .thought-icon {
      flex-shrink: 0;
    }

    .thought-text {
      color: #c4b5fd;
    }

    .leverage-indicator {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      width: fit-content;
    }

    .leverage-indicator[data-direction="up"] {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }

    .leverage-indicator[data-direction="down"] {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .typing-indicator {
      display: flex;
      gap: 4px;
      padding: 1rem;
    }

    .typing-indicator span {
      width: 8px;
      height: 8px;
      background: #64748b;
      border-radius: 50%;
      animation: typing 1.4s infinite;
    }

    .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
    .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes typing {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }

    .response-section {
      padding: 1rem 1.5rem;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    .response-options {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .response-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      padding: 0.875rem 1rem;
      border-radius: 8px;
      color: #e2e8f0;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }

    .response-option:hover {
      border-color: #10b981;
      background: rgba(16, 185, 129, 0.1);
    }

    .option-text {
      flex: 1;
    }

    .option-risk {
      font-size: 0.7rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      margin-left: 1rem;
    }

    .response-option[data-risk="low"] .option-risk { background: #10b981; }
    .response-option[data-risk="medium"] .option-risk { background: #f59e0b; color: black; }
    .response-option[data-risk="high"] .option-risk { background: #ef4444; }

    .custom-response {
      display: flex;
      gap: 0.5rem;
    }

    .custom-response input {
      flex: 1;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      padding: 0.75rem 1rem;
      border-radius: 8px;
      color: #f1f5f9;
    }

    .custom-response input:focus {
      outline: none;
      border-color: #8b5cf6;
    }

    .custom-response button {
      background: #8b5cf6;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      cursor: pointer;
    }

    .custom-response button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .deal-result {
      padding: 2rem;
      text-align: center;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    .result-emoji {
      font-size: 3rem;
      display: block;
      margin-bottom: 1rem;
    }

    .deal-result h3 {
      color: #f1f5f9;
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .deal-result p {
      color: #94a3b8;
      margin-bottom: 0.5rem;
    }

    .deal-result strong {
      color: #10b981;
    }

    .result-analysis {
      font-size: 0.9rem;
      padding: 0.75rem;
      background: rgba(255,255,255,0.05);
      border-radius: 8px;
      margin: 1rem 0;
    }

    .btn-retry, .btn-new {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      margin: 0.5rem;
    }

    .btn-retry {
      background: #10b981;
      border: none;
      color: white;
    }

    .btn-new {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.2);
      color: #f1f5f9;
    }

    /* Intel Panel */
    .intel-panel {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .intel-section {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 1rem;
    }

    .intel-section h4 {
      color: #f1f5f9;
      font-size: 0.875rem;
      margin-bottom: 0.75rem;
    }

    .offer-comparison {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .offer-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .offer-item .label {
      color: #64748b;
      font-size: 0.8rem;
    }

    .offer-item .value {
      font-weight: 600;
    }

    .value.current { color: #f59e0b; }
    .value.market { color: #10b981; }
    .value.budget { color: #8b5cf6; filter: blur(4px); }
    .value.budget.revealed { filter: none; }

    .leverage-meter {
      margin-top: 0.5rem;
    }

    .meter-track {
      height: 8px;
      background: linear-gradient(90deg, #ef4444, #64748b 50%, #10b981);
      border-radius: 4px;
      position: relative;
    }

    .meter-fill {
      position: absolute;
      left: 0;
      top: -4px;
      width: 16px;
      height: 16px;
      background: white;
      border-radius: 50%;
      transform: translateX(-50%);
      border: 3px solid;
      transition: left 0.3s;
    }

    .meter-fill[data-level="high"] { border-color: #10b981; left: 80% !important; }
    .meter-fill[data-level="medium"] { border-color: #64748b; }
    .meter-fill[data-level="low"] { border-color: #ef4444; left: 20% !important; }

    .meter-labels {
      display: flex;
      justify-content: space-between;
      margin-top: 0.5rem;
      font-size: 0.7rem;
      color: #64748b;
    }

    .round-tip {
      color: #94a3b8;
      font-size: 0.85rem;
      line-height: 1.5;
    }

    .toggles {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .toggle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #94a3b8;
      font-size: 0.85rem;
      cursor: pointer;
    }

    .toggle input {
      accent-color: #8b5cf6;
    }

    .tactics h4 {
      margin-bottom: 0.75rem;
    }

    .tactic-card {
      background: rgba(16, 185, 129, 0.1);
      border-left: 3px solid #10b981;
      padding: 0.75rem;
      margin-bottom: 0.5rem;
      border-radius: 0 8px 8px 0;
      font-size: 0.85rem;
      color: #e2e8f0;
    }

    .mock-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #8b5cf6;
      border: none;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
      z-index: 1000;
    }

    @media (max-width: 1024px) {
      .negotiation-layout {
        grid-template-columns: 1fr;
      }

      .intel-panel {
        order: -1;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class SalaryNegotiationDojoComponent {
  scenarios: NegotiationScenario[] = [
    {
      id: 'startup',
      title: 'The Equity Play',
      description: 'Early-stage startup offers lower base but promises equity. How much is fair?',
      initialOffer: 120000,
      marketRate: { min: 140000, max: 170000 },
      companyBudget: 145000,
      difficulty: 3,
      recruiterStyle: 'friendly'
    },
    {
      id: 'faang',
      title: 'Big Tech Lowball',
      description: 'FAANG company offers below your current comp. They assume you want the brand.',
      initialOffer: 180000,
      marketRate: { min: 200000, max: 250000 },
      companyBudget: 235000,
      difficulty: 4,
      recruiterStyle: 'hardball'
    },
    {
      id: 'desperate',
      title: 'Urgent Hire',
      description: 'They need someone yesterday. Previous candidate backed out. You have leverage.',
      initialOffer: 150000,
      marketRate: { min: 145000, max: 175000 },
      companyBudget: 180000,
      difficulty: 2,
      recruiterStyle: 'desperate'
    },
    {
      id: 'budget',
      title: 'The Budget Wall',
      description: '"We really want you but budget is tight." Is it? Find out.',
      initialOffer: 135000,
      marketRate: { min: 150000, max: 180000 },
      companyBudget: 155000,
      difficulty: 5,
      recruiterStyle: 'budget-constrained'
    }
  ];

  activeScenario = signal<NegotiationScenario | null>(null);
  messages = signal<Message[]>([]);
  isTyping = signal(false);
  customResponse = '';

  showThoughtsEnabled = true;
  showBudgetEnabled = false;

  showThoughts = computed(() => this.showThoughtsEnabled);
  showBudget = computed(() => this.showBudgetEnabled);

  state = signal<NegotiationState>({
    currentOffer: 0,
    yourAsk: 0,
    round: 1,
    recruiterPatience: 100,
    yourLeverage: 0,
    dealStatus: 'negotiating'
  });

  currentOptions = signal<Array<{ id: string; text: string; risk: 'low' | 'medium' | 'high'; effect: () => void }>>([]);

  currentTactics = computed(() => {
    const scenario = this.activeScenario();
    if (!scenario) return [];

    const round = this.state().round;
    const tactics: string[] = [];

    if (round === 1) {
      tactics.push('Express enthusiasm first, then pivot to compensation');
      tactics.push('Ask for their range before stating yours');
    } else if (round === 2) {
      tactics.push('Use silence strategically after their counter');
      tactics.push('Reference market data to justify your ask');
    } else {
      tactics.push('Consider non-salary items: signing bonus, equity, vacation');
      tactics.push('Know your walk-away point and stick to it');
    }

    if (scenario.recruiterStyle === 'hardball') {
      tactics.push('Match their energy. Don\'t apologize for your worth.');
    } else if (scenario.recruiterStyle === 'friendly') {
      tactics.push('Don\'t let warmth make you accept less');
    }

    return tactics;
  });

  selectScenario(scenario: NegotiationScenario) {
    this.activeScenario.set(scenario);
    this.state.set({
      currentOffer: scenario.initialOffer,
      yourAsk: 0,
      round: 1,
      recruiterPatience: 100,
      yourLeverage: this.calculateInitialLeverage(scenario),
      dealStatus: 'negotiating'
    });

    // Initial message from recruiter
    this.addMessage({
      sender: 'recruiter',
      text: this.getOpeningMessage(scenario),
      innerThought: this.getOpeningThought(scenario)
    });

    this.generateOptions();
  }

  calculateInitialLeverage(scenario: NegotiationScenario): number {
    if (scenario.recruiterStyle === 'desperate') return 40;
    if (scenario.recruiterStyle === 'hardball') return -20;
    if (scenario.recruiterStyle === 'budget-constrained') return -10;
    return 0;
  }

  getOpeningMessage(scenario: NegotiationScenario): string {
    const messages: Record<string, string> = {
      'friendly': `Great news! The team loved you and we'd like to extend an offer. We're thinking $${scenario.initialOffer.toLocaleString()} base salary. How does that sound?`,
      'hardball': `We've decided to move forward with an offer of $${scenario.initialOffer.toLocaleString()}. This is a competitive package for this role. Let me know your thoughts.`,
      'budget-constrained': `I'm excited to say we want to bring you on board! I'll be honest - our budget for this role is $${scenario.initialOffer.toLocaleString()}. I know it might be below your expectations, but we can talk about other benefits.`,
      'desperate': `We really need someone with your background ASAP. Our initial offer is $${scenario.initialOffer.toLocaleString()}, but we're definitely open to discussion. When can you start?`
    };
    return messages[scenario.recruiterStyle];
  }

  getOpeningThought(scenario: NegotiationScenario): string {
    const thoughts: Record<string, string> = {
      'friendly': `We have budget up to $${scenario.companyBudget.toLocaleString()} but let's see if they take the first offer...`,
      'hardball': `I've been told to start low. Let's see how they respond before I show any flexibility.`,
      'budget-constrained': `This is actually close to our max. I hope they don't push too hard.`,
      'desperate': `We're about to lose this project if we don't fill this. I can go higher if needed.`
    };
    return thoughts[scenario.recruiterStyle];
  }

  generateOptions() {
    const scenario = this.activeScenario();
    const state = this.state();
    if (!scenario) return;

    const marketMid = (scenario.marketRate.min + scenario.marketRate.max) / 2;

    this.currentOptions.set([
      {
        id: 'accept',
        text: 'Accept the current offer',
        risk: 'low',
        effect: () => this.acceptOffer()
      },
      {
        id: 'counter-reasonable',
        text: `Counter with $${(state.currentOffer * 1.1).toLocaleString()} (+10%)`,
        risk: 'low',
        effect: () => this.makeCounter(state.currentOffer * 1.1, 'reasonable')
      },
      {
        id: 'counter-aggressive',
        text: `Counter with $${marketMid.toLocaleString()} (market rate)`,
        risk: 'medium',
        effect: () => this.makeCounter(marketMid, 'aggressive')
      },
      {
        id: 'counter-bold',
        text: `Counter with $${scenario.marketRate.max.toLocaleString()} (top of market)`,
        risk: 'high',
        effect: () => this.makeCounter(scenario.marketRate.max, 'bold')
      }
    ]);
  }

  selectResponse(option: { effect: () => void }) {
    option.effect();
  }

  sendCustomResponse() {
    if (!this.customResponse.trim()) return;

    const text = this.customResponse.toLowerCase();

    // Parse custom response for intent
    if (text.includes('accept') || text.includes('sounds good') || text.includes('deal')) {
      this.acceptOffer();
    } else if (text.includes('walk') || text.includes('pass') || text.includes('decline')) {
      this.walkAway();
    } else {
      // Try to extract a number
      const match = text.match(/\$?(\d{1,3}(?:,?\d{3})*)/);
      if (match) {
        const amount = parseInt(match[1].replace(/,/g, ''));
        if (amount > 50000 && amount < 500000) {
          const style = amount > this.state().currentOffer * 1.25 ? 'bold' : 'reasonable';
          this.makeCounter(amount, style);
        }
      } else {
        // Generic response
        this.addMessage({ sender: 'you', text: this.customResponse });
        this.simulateRecruiterResponse('I appreciate that. Can we talk specific numbers?');
      }
    }

    this.customResponse = '';
  }

  acceptOffer() {
    this.addMessage({
      sender: 'you',
      text: `I accept. $${this.state().currentOffer.toLocaleString()} works for me.`
    });

    this.state.update(s => ({ ...s, dealStatus: 'accepted' }));
  }

  walkAway() {
    this.addMessage({
      sender: 'you',
      text: `I appreciate the offer, but I'll have to pass. The compensation doesn't meet my requirements.`
    });

    this.state.update(s => ({ ...s, dealStatus: 'walked' }));
  }

  makeCounter(amount: number, style: 'reasonable' | 'aggressive' | 'bold') {
    const scenario = this.activeScenario()!;
    const state = this.state();

    this.addMessage({
      sender: 'you',
      text: `I'm very excited about the opportunity. Based on my experience and market rates, I was hoping for something closer to $${amount.toLocaleString()}.`,
      leverage: style === 'bold' ? 15 : (style === 'aggressive' ? 5 : 0)
    });

    this.isTyping.set(true);

    setTimeout(() => {
      this.isTyping.set(false);

      // Calculate recruiter response
      const gap = amount - state.currentOffer;
      const budgetRoom = scenario.companyBudget - state.currentOffer;
      const patienceLoss = style === 'bold' ? 30 : (style === 'aggressive' ? 15 : 5);

      this.state.update(s => ({
        ...s,
        round: s.round + 1,
        recruiterPatience: Math.max(0, s.recruiterPatience - patienceLoss),
        yourLeverage: s.yourLeverage + (style === 'bold' ? -10 : 5)
      }));

      if (this.state().recruiterPatience <= 0 && style === 'bold') {
        this.addMessage({
          sender: 'recruiter',
          text: `I understand, but we simply can't go that high. I'm afraid we'll need to move on to other candidates.`,
          innerThought: `This person is unrealistic. We're done here.`
        });
        this.state.update(s => ({ ...s, dealStatus: 'rejected' }));
        return;
      }

      if (amount <= scenario.companyBudget) {
        // They can afford it
        if (style === 'reasonable' || scenario.recruiterStyle === 'desperate') {
          const newOffer = Math.min(amount, scenario.companyBudget);
          this.addMessage({
            sender: 'recruiter',
            text: `Let me see what I can do... I can get you to $${newOffer.toLocaleString()}. That's the best I can offer.`,
            innerThought: `That's within budget. Let's close this.`,
            leverage: -10
          });
          this.state.update(s => ({ ...s, currentOffer: newOffer }));
        } else {
          const counterOffer = state.currentOffer + (gap * 0.5);
          this.addMessage({
            sender: 'recruiter',
            text: `That's higher than we planned, but I can go to $${counterOffer.toLocaleString()}. Can you work with that?`,
            innerThought: `I have room but want to keep some buffer.`,
            leverage: 5
          });
          this.state.update(s => ({ ...s, currentOffer: counterOffer }));
        }
      } else {
        // Above budget
        const maxOffer = scenario.companyBudget;
        this.addMessage({
          sender: 'recruiter',
          text: `I understand where you're coming from. The absolute highest I can go is $${maxOffer.toLocaleString()}. That's stretching our budget as it is.`,
          innerThought: `That's genuinely our max. I hope they take it.`,
          leverage: -5
        });
        this.state.update(s => ({ ...s, currentOffer: maxOffer }));
      }

      this.generateOptions();
    }, 2000);
  }

  simulateRecruiterResponse(text: string) {
    this.isTyping.set(true);
    setTimeout(() => {
      this.isTyping.set(false);
      this.addMessage({ sender: 'recruiter', text });
    }, 1500);
  }

  addMessage(msg: Partial<Message>) {
    this.messages.update(msgs => [...msgs, {
      id: Date.now().toString(),
      timestamp: Date.now(),
      sender: msg.sender!,
      text: msg.text!,
      innerThought: msg.innerThought,
      leverage: msg.leverage
    }]);
  }

  getStyleEmoji(style: string): string {
    const emojis: Record<string, string> = {
      'hardball': '😤',
      'friendly': '😊',
      'budget-constrained': '😰',
      'desperate': '😅'
    };
    return emojis[style] || '🤝';
  }

  getRecruiterName(): string {
    const scenario = this.activeScenario();
    if (!scenario) return 'Recruiter';
    const names: Record<string, string> = {
      'hardball': 'Victoria Sharp',
      'friendly': 'Mike Chen',
      'budget-constrained': 'Sarah Miller',
      'desperate': 'Tom Quick'
    };
    return names[scenario.recruiterStyle];
  }

  getPatienceLevel(): string {
    const patience = this.state().recruiterPatience;
    if (patience > 60) return 'high';
    if (patience > 30) return 'medium';
    return 'low';
  }

  getLeverageLevel(): string {
    const leverage = this.state().yourLeverage;
    if (leverage > 20) return 'high';
    if (leverage > -20) return 'medium';
    return 'low';
  }

  getRoundTip(): string {
    const round = this.state().round;
    const tips = [
      'First counter is crucial. Don\'t accept immediately.',
      'Now they\'re assessing if you\'ll budge. Stay firm on key points.',
      'This is usually decision time. Consider the full package.',
      'Extended negotiation can damage the relationship. Find middle ground.'
    ];
    return tips[Math.min(round - 1, tips.length - 1)];
  }

  resetScenario() {
    const scenario = this.activeScenario();
    if (scenario) {
      this.messages.set([]);
      this.selectScenario(scenario);
    }
  }

  clearScenario() {
    this.activeScenario.set(null);
    this.messages.set([]);
  }

  loadMockScenario() {
    this.selectScenario(this.scenarios[2]); // The urgent hire scenario
  }
}
