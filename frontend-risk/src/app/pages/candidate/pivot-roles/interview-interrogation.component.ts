import { Component, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface InterviewerPersona {
  id: string;
  name: string;
  role: string;
  avatar: string;
  style: 'skeptic' | 'griller' | 'friendly' | 'executive';
  description: string;
  difficulty: number;
}

interface ThoughtBubble {
  id: string;
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'warning';
  timestamp: number;
}

interface InterviewQuestion {
  id: string;
  question: string;
  category: 'behavioral' | 'technical' | 'situational' | 'culture';
  followUps: string[];
  redFlags: string[];
  greenFlags: string[];
}

interface InterviewMetrics {
  confidence: number;
  clarity: number;
  relevance: number;
  authenticity: number;
  redFlagCount: number;
  greenFlagCount: number;
}

@Component({
  selector: 'app-interview-interrogation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="interrogation-container">
      <!-- Header -->
      <div class="header">
        <div class="header-content">
          <h1>🎭 Interview Interrogation Room</h1>
          <p>See inside the interviewer's mind. Practice until you're unbreakable.</p>
        </div>
        <div class="session-controls">
          @if (isInSession()) {
            <button class="btn-end" (click)="endSession()">End Session</button>
          }
        </div>
      </div>

      @if (!isInSession()) {
        <!-- Persona Selection -->
        <div class="persona-selection">
          <h2>Choose Your Interrogator</h2>
          <p class="subtitle">Each interviewer has a different style. Master them all.</p>

          <div class="persona-grid">
            @for (persona of personas; track persona.id) {
              <div
                class="persona-card"
                [class.selected]="selectedPersona()?.id === persona.id"
                (click)="selectPersona(persona)"
              >
                <div class="persona-avatar">{{ persona.avatar }}</div>
                <div class="persona-info">
                  <h3>{{ persona.name }}</h3>
                  <span class="persona-role">{{ persona.role }}</span>
                  <p class="persona-desc">{{ persona.description }}</p>
                  <div class="difficulty">
                    <span class="label">Difficulty:</span>
                    <div class="difficulty-bar">
                      @for (i of [1,2,3,4,5]; track i) {
                        <div class="pip" [class.filled]="i <= persona.difficulty"></div>
                      }
                    </div>
                  </div>
                </div>
                <div class="persona-style" [attr.data-style]="persona.style">
                  {{ persona.style | titlecase }}
                </div>
              </div>
            }
          </div>

          <button
            class="btn-start"
            [disabled]="!selectedPersona()"
            (click)="startSession()"
          >
            Enter the Room →
          </button>
        </div>
      } @else {
        <!-- Interview Session -->
        <div class="interview-session">
          <div class="session-layout">
            <!-- Left: Interviewer -->
            <div class="interviewer-panel">
              <div class="interviewer-header">
                <div class="interviewer-avatar large">{{ selectedPersona()!.avatar }}</div>
                <div class="interviewer-info">
                  <h3>{{ selectedPersona()!.name }}</h3>
                  <span>{{ selectedPersona()!.role }}</span>
                </div>
                <div class="mood-indicator" [attr.data-mood]="currentMood()">
                  {{ getMoodEmoji() }}
                </div>
              </div>

              <!-- Thought Bubbles - THE UNIQUE PART -->
              <div class="thought-stream">
                <div class="thought-header">
                  <span class="brain-icon">🧠</span>
                  <span>What they're REALLY thinking...</span>
                </div>
                <div class="thoughts-container">
                  @for (thought of visibleThoughts(); track thought.id) {
                    <div class="thought-bubble" [attr.data-sentiment]="thought.sentiment" [@fadeIn]>
                      <span class="thought-text">{{ thought.text }}</span>
                    </div>
                  }
                  @if (isThinking()) {
                    <div class="thought-bubble thinking">
                      <span class="dots">
                        <span>.</span><span>.</span><span>.</span>
                      </span>
                    </div>
                  }
                </div>
              </div>

              <!-- Current Question -->
              <div class="question-card">
                <div class="question-category">{{ currentQuestion()?.category | uppercase }}</div>
                <p class="question-text">{{ currentQuestion()?.question }}</p>
                <div class="question-timer">
                  <div class="timer-bar" [style.width.%]="timerProgress()"></div>
                </div>
              </div>
            </div>

            <!-- Right: Your Response -->
            <div class="response-panel">
              <!-- Real-time Metrics -->
              <div class="metrics-dashboard">
                <h4>Live Analysis</h4>
                <div class="metrics-grid">
                  <div class="metric">
                    <span class="metric-label">Confidence</span>
                    <div class="metric-bar">
                      <div class="fill" [style.width.%]="metrics().confidence" [attr.data-level]="getLevel(metrics().confidence)"></div>
                    </div>
                    <span class="metric-value">{{ metrics().confidence }}%</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">Clarity</span>
                    <div class="metric-bar">
                      <div class="fill" [style.width.%]="metrics().clarity" [attr.data-level]="getLevel(metrics().clarity)"></div>
                    </div>
                    <span class="metric-value">{{ metrics().clarity }}%</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">Relevance</span>
                    <div class="metric-bar">
                      <div class="fill" [style.width.%]="metrics().relevance" [attr.data-level]="getLevel(metrics().relevance)"></div>
                    </div>
                    <span class="metric-value">{{ metrics().relevance }}%</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">Authenticity</span>
                    <div class="metric-bar">
                      <div class="fill" [style.width.%]="metrics().authenticity" [attr.data-level]="getLevel(metrics().authenticity)"></div>
                    </div>
                    <span class="metric-value">{{ metrics().authenticity }}%</span>
                  </div>
                </div>
                <div class="flag-counters">
                  <span class="green-flags">✓ {{ metrics().greenFlagCount }} Green Flags</span>
                  <span class="red-flags">⚠ {{ metrics().redFlagCount }} Red Flags</span>
                </div>
              </div>

              <!-- Response Input -->
              <div class="response-input">
                <textarea
                  [(ngModel)]="userResponse"
                  (input)="onResponseChange()"
                  placeholder="Type your answer... (or press spacebar to simulate speaking)"
                  rows="6"
                ></textarea>
                <div class="response-actions">
                  <button class="btn-submit" (click)="submitResponse()" [disabled]="!userResponse.trim()">
                    Submit Answer
                  </button>
                  <button class="btn-skip" (click)="skipQuestion()">
                    Skip (looks bad)
                  </button>
                </div>
              </div>

              <!-- Red Flag Alerts -->
              @if (activeRedFlags().length > 0) {
                <div class="red-flag-alerts">
                  <h4>⚠️ Red Flags Detected</h4>
                  @for (flag of activeRedFlags(); track flag) {
                    <div class="flag-item">{{ flag }}</div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="session-progress">
            <div class="progress-info">
              <span>Question {{ currentQuestionIndex() + 1 }} of {{ totalQuestions }}</span>
              <span class="time-elapsed">{{ formatTime(elapsedTime()) }}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="((currentQuestionIndex() + 1) / totalQuestions) * 100"></div>
            </div>
          </div>
        </div>
      }

      <!-- Results Modal -->
      @if (showResults()) {
        <div class="results-overlay" (click)="closeResults()">
          <div class="results-modal" (click)="$event.stopPropagation()">
            <div class="verdict-header" [attr.data-verdict]="finalVerdict()">
              <span class="verdict-emoji">{{ getVerdictEmoji() }}</span>
              <h2>{{ getVerdictTitle() }}</h2>
              <p class="verdict-subtitle">{{ getVerdictSubtitle() }}</p>
            </div>

            <div class="results-breakdown">
              <div class="score-card">
                <div class="score-circle" [attr.data-score]="getScoreLevel(finalScore())">
                  {{ finalScore() }}%
                </div>
                <span>Overall Score</span>
              </div>

              <div class="feedback-sections">
                <div class="feedback-section positive">
                  <h4>💪 What Worked</h4>
                  @for (item of positiveFeedback(); track item) {
                    <p>{{ item }}</p>
                  }
                </div>
                <div class="feedback-section negative">
                  <h4>😬 The Uncomfortable Truth</h4>
                  @for (item of negativeFeedback(); track item) {
                    <p>{{ item }}</p>
                  }
                </div>
                <div class="feedback-section tips">
                  <h4>🎯 If This Were Real</h4>
                  <p class="verdict-reality">{{ realityCheck() }}</p>
                </div>
              </div>
            </div>

            <div class="results-actions">
              <button class="btn-retry" (click)="retryWithSamePersona()">Try Again</button>
              <button class="btn-different" (click)="closeResults()">Different Interviewer</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .interrogation-container {
      min-height: 100vh;
      background: linear-gradient(180deg, #0a0a0f 0%, #12121a 100%);
      padding: 2rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
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

    .btn-end {
      background: #ef4444;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      cursor: pointer;
    }

    /* Persona Selection */
    .persona-selection {
      max-width: 1200px;
      margin: 0 auto;
      text-align: center;
    }

    .persona-selection h2 {
      font-size: 1.75rem;
      color: #f1f5f9;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: #64748b;
      margin-bottom: 2rem;
    }

    .persona-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .persona-card {
      background: rgba(255,255,255,0.03);
      border: 2px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.3s;
      text-align: left;
      position: relative;
    }

    .persona-card:hover {
      border-color: rgba(139, 92, 246, 0.5);
      transform: translateY(-4px);
    }

    .persona-card.selected {
      border-color: #8b5cf6;
      background: rgba(139, 92, 246, 0.1);
    }

    .persona-avatar {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .persona-info h3 {
      color: #f1f5f9;
      font-size: 1.25rem;
      margin-bottom: 0.25rem;
    }

    .persona-role {
      color: #8b5cf6;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .persona-desc {
      color: #94a3b8;
      font-size: 0.875rem;
      margin: 1rem 0;
      line-height: 1.5;
    }

    .difficulty {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .difficulty .label {
      color: #64748b;
      font-size: 0.75rem;
    }

    .difficulty-bar {
      display: flex;
      gap: 3px;
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

    .persona-style {
      position: absolute;
      top: 1rem;
      right: 1rem;
      font-size: 0.7rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;
      font-weight: 600;
    }

    .persona-style[data-style="skeptic"] { background: #ef4444; color: white; }
    .persona-style[data-style="griller"] { background: #f59e0b; color: black; }
    .persona-style[data-style="friendly"] { background: #10b981; color: white; }
    .persona-style[data-style="executive"] { background: #6366f1; color: white; }

    .btn-start {
      background: linear-gradient(135deg, #8b5cf6, #6366f1);
      border: none;
      padding: 1rem 3rem;
      border-radius: 12px;
      color: white;
      font-size: 1.125rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-start:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-start:not(:disabled):hover {
      transform: scale(1.05);
      box-shadow: 0 8px 30px rgba(139, 92, 246, 0.4);
    }

    /* Interview Session */
    .session-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .interviewer-panel {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 1.5rem;
    }

    .interviewer-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .interviewer-avatar.large {
      font-size: 3rem;
    }

    .interviewer-info h3 {
      color: #f1f5f9;
      margin-bottom: 0.25rem;
    }

    .interviewer-info span {
      color: #64748b;
      font-size: 0.875rem;
    }

    .mood-indicator {
      margin-left: auto;
      font-size: 2rem;
      padding: 0.5rem;
      border-radius: 50%;
      background: rgba(255,255,255,0.05);
    }

    /* Thought Bubbles - THE MAGIC */
    .thought-stream {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1));
      border-radius: 12px;
      padding: 1rem;
      margin-bottom: 1.5rem;
      min-height: 200px;
    }

    .thought-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #a78bfa;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .brain-icon {
      font-size: 1.25rem;
    }

    .thoughts-container {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-height: 180px;
      overflow-y: auto;
    }

    .thought-bubble {
      background: rgba(255,255,255,0.1);
      padding: 0.75rem 1rem;
      border-radius: 12px;
      border-bottom-left-radius: 4px;
      font-size: 0.9rem;
      color: #e2e8f0;
      animation: fadeIn 0.3s ease;
      position: relative;
    }

    .thought-bubble[data-sentiment="positive"] {
      background: rgba(16, 185, 129, 0.2);
      border-left: 3px solid #10b981;
    }

    .thought-bubble[data-sentiment="negative"] {
      background: rgba(239, 68, 68, 0.2);
      border-left: 3px solid #ef4444;
    }

    .thought-bubble[data-sentiment="warning"] {
      background: rgba(245, 158, 11, 0.2);
      border-left: 3px solid #f59e0b;
    }

    .thought-bubble[data-sentiment="neutral"] {
      border-left: 3px solid #64748b;
    }

    .thought-bubble.thinking {
      background: rgba(255,255,255,0.05);
    }

    .dots span {
      animation: blink 1.4s infinite;
      font-size: 1.5rem;
    }

    .dots span:nth-child(2) { animation-delay: 0.2s; }
    .dots span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes blink {
      0%, 100% { opacity: 0.2; }
      50% { opacity: 1; }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .question-card {
      background: rgba(255,255,255,0.05);
      border-radius: 12px;
      padding: 1.5rem;
    }

    .question-category {
      font-size: 0.7rem;
      color: #8b5cf6;
      font-weight: 600;
      letter-spacing: 0.1em;
      margin-bottom: 0.75rem;
    }

    .question-text {
      color: #f1f5f9;
      font-size: 1.25rem;
      line-height: 1.5;
      margin-bottom: 1rem;
    }

    .question-timer {
      height: 4px;
      background: rgba(255,255,255,0.1);
      border-radius: 2px;
      overflow: hidden;
    }

    .timer-bar {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #f59e0b, #ef4444);
      transition: width 1s linear;
    }

    /* Response Panel */
    .response-panel {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .metrics-dashboard {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 1.25rem;
    }

    .metrics-dashboard h4 {
      color: #f1f5f9;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .metric {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .metric-label {
      font-size: 0.75rem;
      color: #64748b;
    }

    .metric-bar {
      height: 6px;
      background: rgba(255,255,255,0.1);
      border-radius: 3px;
      overflow: hidden;
    }

    .metric-bar .fill {
      height: 100%;
      transition: width 0.5s ease;
    }

    .fill[data-level="high"] { background: #10b981; }
    .fill[data-level="medium"] { background: #f59e0b; }
    .fill[data-level="low"] { background: #ef4444; }

    .metric-value {
      font-size: 0.875rem;
      color: #f1f5f9;
      font-weight: 600;
    }

    .flag-counters {
      display: flex;
      justify-content: space-between;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    .green-flags { color: #10b981; font-size: 0.875rem; }
    .red-flags { color: #ef4444; font-size: 0.875rem; }

    .response-input {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 1.25rem;
    }

    .response-input textarea {
      width: 100%;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 1rem;
      color: #f1f5f9;
      font-size: 1rem;
      resize: none;
      margin-bottom: 1rem;
    }

    .response-input textarea:focus {
      outline: none;
      border-color: #8b5cf6;
    }

    .response-actions {
      display: flex;
      gap: 1rem;
    }

    .btn-submit {
      flex: 1;
      background: #10b981;
      border: none;
      padding: 0.875rem;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-skip {
      background: transparent;
      border: 1px solid #ef4444;
      padding: 0.875rem 1.5rem;
      border-radius: 8px;
      color: #ef4444;
      font-weight: 500;
      cursor: pointer;
    }

    .red-flag-alerts {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 12px;
      padding: 1rem;
    }

    .red-flag-alerts h4 {
      color: #ef4444;
      font-size: 0.875rem;
      margin-bottom: 0.75rem;
    }

    .flag-item {
      color: #fca5a5;
      font-size: 0.875rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(239, 68, 68, 0.2);
    }

    .flag-item:last-child {
      border-bottom: none;
    }

    /* Progress */
    .session-progress {
      max-width: 1400px;
      margin: 2rem auto 0;
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      color: #64748b;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .progress-bar {
      height: 6px;
      background: rgba(255,255,255,0.1);
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #8b5cf6, #6366f1);
      transition: width 0.3s;
    }

    /* Results Modal */
    .results-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 2rem;
    }

    .results-modal {
      background: #1a1a2e;
      border-radius: 20px;
      max-width: 700px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .verdict-header {
      padding: 2.5rem;
      text-align: center;
      border-radius: 20px 20px 0 0;
    }

    .verdict-header[data-verdict="hired"] {
      background: linear-gradient(135deg, #10b981, #059669);
    }

    .verdict-header[data-verdict="maybe"] {
      background: linear-gradient(135deg, #f59e0b, #d97706);
    }

    .verdict-header[data-verdict="rejected"] {
      background: linear-gradient(135deg, #ef4444, #dc2626);
    }

    .verdict-emoji {
      font-size: 4rem;
      display: block;
      margin-bottom: 1rem;
    }

    .verdict-header h2 {
      color: white;
      font-size: 1.75rem;
      margin-bottom: 0.5rem;
    }

    .verdict-subtitle {
      color: rgba(255,255,255,0.8);
    }

    .results-breakdown {
      padding: 2rem;
    }

    .score-card {
      text-align: center;
      margin-bottom: 2rem;
    }

    .score-circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      font-weight: bold;
      color: white;
      margin: 0 auto 0.5rem;
    }

    .score-circle[data-score="high"] { background: #10b981; }
    .score-circle[data-score="medium"] { background: #f59e0b; }
    .score-circle[data-score="low"] { background: #ef4444; }

    .score-card span {
      color: #64748b;
      font-size: 0.875rem;
    }

    .feedback-sections {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .feedback-section {
      padding: 1.25rem;
      border-radius: 12px;
    }

    .feedback-section.positive {
      background: rgba(16, 185, 129, 0.1);
      border-left: 4px solid #10b981;
    }

    .feedback-section.negative {
      background: rgba(239, 68, 68, 0.1);
      border-left: 4px solid #ef4444;
    }

    .feedback-section.tips {
      background: rgba(139, 92, 246, 0.1);
      border-left: 4px solid #8b5cf6;
    }

    .feedback-section h4 {
      color: #f1f5f9;
      font-size: 1rem;
      margin-bottom: 0.75rem;
    }

    .feedback-section p {
      color: #94a3b8;
      font-size: 0.9rem;
      line-height: 1.5;
      margin-bottom: 0.5rem;
    }

    .verdict-reality {
      color: #e2e8f0 !important;
      font-style: italic;
    }

    .results-actions {
      display: flex;
      gap: 1rem;
      padding: 0 2rem 2rem;
    }

    .btn-retry, .btn-different {
      flex: 1;
      padding: 1rem;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-retry {
      background: #8b5cf6;
      border: none;
      color: white;
    }

    .btn-different {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.2);
      color: #f1f5f9;
    }

    @media (max-width: 1024px) {
      .session-layout {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class InterviewInterrogationComponent implements OnDestroy {
  // Personas
  personas: InterviewerPersona[] = [
    {
      id: 'skeptic',
      name: 'Alexandra Stone',
      role: 'VP of Engineering',
      avatar: '👩‍💼',
      style: 'skeptic',
      description: 'Assumes you\'re exaggerating. Will probe every claim until you crack or prove yourself.',
      difficulty: 5
    },
    {
      id: 'griller',
      name: 'Marcus Chen',
      role: 'Staff Engineer',
      avatar: '🧑‍💻',
      style: 'griller',
      description: 'Deep technical questions. Will go 5 levels deep on anything you mention. Silences are deliberate.',
      difficulty: 4
    },
    {
      id: 'friendly',
      name: 'Sarah Mitchell',
      role: 'Engineering Manager',
      avatar: '👩‍🦰',
      style: 'friendly',
      description: 'Seems nice but is actually evaluating hard. Her warmth makes people overshare red flags.',
      difficulty: 3
    },
    {
      id: 'executive',
      name: 'James Morrison',
      role: 'CTO',
      avatar: '👨‍💼',
      style: 'executive',
      description: 'Big picture thinker. Bored by details, wants to know if you can lead and think strategically.',
      difficulty: 4
    }
  ];

  // Questions pool
  questions: InterviewQuestion[] = [
    {
      id: 'q1',
      question: 'Tell me about a time you disagreed with your manager. How did you handle it?',
      category: 'behavioral',
      followUps: ['What was the outcome?', 'Would you do anything differently?'],
      redFlags: ['badmouthing', 'blame', 'conflict avoidance', 'never disagreed'],
      greenFlags: ['professional', 'data-driven', 'collaborative', 'outcome-focused']
    },
    {
      id: 'q2',
      question: 'What\'s your biggest weakness?',
      category: 'behavioral',
      followUps: ['How has this affected your work?', 'What are you doing about it?'],
      redFlags: ['perfectionist cliche', 'humble brag', 'vague', 'no self-awareness'],
      greenFlags: ['specific', 'honest', 'improvement plan', 'self-aware']
    },
    {
      id: 'q3',
      question: 'Why are you leaving your current role?',
      category: 'situational',
      followUps: ['What would make you stay?', 'How long were you there?'],
      redFlags: ['complaining', 'money only', 'vague', 'short tenure'],
      greenFlags: ['growth-focused', 'positive framing', 'specific goals']
    },
    {
      id: 'q4',
      question: 'Describe a project that failed. What was your role in the failure?',
      category: 'behavioral',
      followUps: ['What did you learn?', 'How did it affect the team?'],
      redFlags: ['blame others', 'deny failure', 'no lessons learned'],
      greenFlags: ['ownership', 'specific learnings', 'applied lessons']
    },
    {
      id: 'q5',
      question: 'Where do you see yourself in 5 years?',
      category: 'situational',
      followUps: ['Why that path?', 'What skills do you need?'],
      redFlags: ['your job', 'unrealistic', 'no plan', 'leaving soon'],
      greenFlags: ['growth trajectory', 'aligned with role', 'thoughtful']
    },
    {
      id: 'q6',
      question: 'Tell me about the most complex technical problem you\'ve solved.',
      category: 'technical',
      followUps: ['Walk me through your approach', 'What alternatives did you consider?'],
      redFlags: ['vague', 'took credit for team', 'no depth', 'outdated tech'],
      greenFlags: ['systematic approach', 'trade-offs discussed', 'measurable impact']
    }
  ];

  // State
  selectedPersona = signal<InterviewerPersona | null>(null);
  isInSession = signal(false);
  currentQuestionIndex = signal(0);
  currentQuestion = signal<InterviewQuestion | null>(null);
  userResponse = '';

  thoughts = signal<ThoughtBubble[]>([]);
  visibleThoughts = computed(() => this.thoughts().slice(-4));
  isThinking = signal(false);
  currentMood = signal<'neutral' | 'impressed' | 'skeptical' | 'concerned'>('neutral');

  metrics = signal<InterviewMetrics>({
    confidence: 50,
    clarity: 50,
    relevance: 50,
    authenticity: 50,
    redFlagCount: 0,
    greenFlagCount: 0
  });

  activeRedFlags = signal<string[]>([]);
  timerProgress = signal(100);
  elapsedTime = signal(0);
  totalQuestions = 6;

  showResults = signal(false);
  finalScore = signal(0);
  finalVerdict = signal<'hired' | 'maybe' | 'rejected'>('maybe');
  positiveFeedback = signal<string[]>([]);
  negativeFeedback = signal<string[]>([]);
  realityCheck = signal('');

  private timerInterval: any;
  private thoughtInterval: any;
  private elapsedInterval: any;

  selectPersona(persona: InterviewerPersona) {
    this.selectedPersona.set(persona);
  }

  startSession() {
    if (!this.selectedPersona()) return;

    this.isInSession.set(true);
    this.currentQuestionIndex.set(0);
    this.loadQuestion(0);
    this.startTimer();
    this.startElapsedTimer();

    // Initial thought
    setTimeout(() => {
      this.addThought('Let\'s see what this candidate is made of...', 'neutral');
    }, 1000);
  }

  loadQuestion(index: number) {
    const shuffled = [...this.questions].sort(() => Math.random() - 0.5);
    this.currentQuestion.set(shuffled[index % shuffled.length]);
    this.timerProgress.set(100);
    this.activeRedFlags.set([]);

    // Generate initial interviewer thought about the question
    setTimeout(() => {
      const questionThoughts = [
        'This question usually reveals a lot...',
        'Let\'s see how they handle this one.',
        'Most candidates struggle here.',
        'Time to dig deeper.'
      ];
      this.addThought(questionThoughts[Math.floor(Math.random() * questionThoughts.length)], 'neutral');
    }, 500);
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      const current = this.timerProgress();
      if (current > 0) {
        this.timerProgress.set(current - 0.5);
      }
    }, 500);
  }

  startElapsedTimer() {
    this.elapsedInterval = setInterval(() => {
      this.elapsedTime.update(t => t + 1);
    }, 1000);
  }

  onResponseChange() {
    // Analyze response in real-time
    const text = this.userResponse.toLowerCase();
    const question = this.currentQuestion();
    if (!question) return;

    // Check for red flags
    const detectedRedFlags: string[] = [];
    if (text.includes('blame') || text.includes('their fault') || text.includes('they didn\'t')) {
      detectedRedFlags.push('Sounds like you\'re blaming others');
      this.addThought('Hmm, deflecting responsibility...', 'negative');
    }
    if (text.includes('perfectionist') && question.id === 'q2') {
      detectedRedFlags.push('The "perfectionist" answer is a cliché');
      this.addThought('Really? The perfectionist answer? 🙄', 'negative');
    }
    if (text.includes('money') || text.includes('salary') || text.includes('pay')) {
      if (question.id === 'q3') {
        detectedRedFlags.push('Leading with compensation concerns');
      }
    }

    // Check for green flags
    if (text.includes('learned') || text.includes('improved') || text.includes('grew')) {
      this.metrics.update(m => ({ ...m, greenFlagCount: m.greenFlagCount + 1 }));
      this.addThought('Shows growth mindset, that\'s good.', 'positive');
    }

    if (text.includes('data') || text.includes('metrics') || text.includes('measured')) {
      this.addThought('Ah, uses data to back up claims. I like that.', 'positive');
    }

    // Update metrics based on response length and content
    const wordCount = this.userResponse.split(' ').length;
    this.metrics.update(m => ({
      ...m,
      confidence: Math.min(100, 50 + wordCount * 2),
      clarity: Math.min(100, wordCount > 10 && wordCount < 100 ? 70 : 40),
      relevance: detectedRedFlags.length > 0 ? 40 : 70,
      redFlagCount: m.redFlagCount + detectedRedFlags.length
    }));

    this.activeRedFlags.set(detectedRedFlags);
  }

  addThought(text: string, sentiment: ThoughtBubble['sentiment']) {
    const thought: ThoughtBubble = {
      id: Date.now().toString(),
      text,
      sentiment,
      timestamp: Date.now()
    };
    this.thoughts.update(t => [...t, thought]);

    // Update mood based on sentiment
    if (sentiment === 'positive') this.currentMood.set('impressed');
    else if (sentiment === 'negative') this.currentMood.set('concerned');
    else if (sentiment === 'warning') this.currentMood.set('skeptical');
  }

  submitResponse() {
    if (!this.userResponse.trim()) return;

    this.isThinking.set(true);

    setTimeout(() => {
      this.isThinking.set(false);

      // Generate interviewer reaction based on response quality
      const quality = this.assessResponseQuality();

      if (quality > 70) {
        this.addThought('Solid answer. They seem to know what they\'re talking about.', 'positive');
        this.metrics.update(m => ({ ...m, greenFlagCount: m.greenFlagCount + 1 }));
      } else if (quality > 40) {
        this.addThought('Decent, but I\'ve heard better. Moving on...', 'neutral');
      } else {
        this.addThought('That was weak. Noted for the feedback.', 'warning');
        this.metrics.update(m => ({ ...m, redFlagCount: m.redFlagCount + 1 }));
      }

      // Next question or end
      this.userResponse = '';
      const nextIndex = this.currentQuestionIndex() + 1;

      if (nextIndex >= this.totalQuestions) {
        this.endSession();
      } else {
        this.currentQuestionIndex.set(nextIndex);
        this.loadQuestion(nextIndex);
      }
    }, 1500);
  }

  assessResponseQuality(): number {
    const text = this.userResponse;
    let score = 50;

    // Length check
    const words = text.split(' ').length;
    if (words > 20 && words < 150) score += 15;
    else if (words < 10) score -= 20;
    else if (words > 200) score -= 10;

    // Structure check (has specific examples)
    if (text.includes('example') || text.includes('instance') || text.includes('specifically')) {
      score += 10;
    }

    // Positive language
    if (text.includes('achieved') || text.includes('delivered') || text.includes('improved')) {
      score += 10;
    }

    return Math.min(100, Math.max(0, score));
  }

  skipQuestion() {
    this.addThought('Skipping? That\'s concerning...', 'negative');
    this.metrics.update(m => ({ ...m, redFlagCount: m.redFlagCount + 2 }));

    const nextIndex = this.currentQuestionIndex() + 1;
    if (nextIndex >= this.totalQuestions) {
      this.endSession();
    } else {
      this.currentQuestionIndex.set(nextIndex);
      this.loadQuestion(nextIndex);
    }
  }

  endSession() {
    clearInterval(this.timerInterval);
    clearInterval(this.elapsedInterval);

    // Calculate final score
    const m = this.metrics();
    const score = Math.round(
      (m.confidence + m.clarity + m.relevance + m.authenticity) / 4 -
      (m.redFlagCount * 5) +
      (m.greenFlagCount * 5)
    );
    this.finalScore.set(Math.min(100, Math.max(0, score)));

    // Determine verdict
    if (score >= 75) {
      this.finalVerdict.set('hired');
      this.positiveFeedback.set([
        'Your answers showed self-awareness and growth mindset.',
        'You backed up claims with specific examples.',
        'Good balance of confidence and humility.'
      ]);
      this.negativeFeedback.set([
        'Could still be more concise in some areas.',
        'Watch the pace - you\'re not in a race.'
      ]);
      this.realityCheck.set('Strong candidate. Would likely advance to final rounds and receive an offer.');
    } else if (score >= 50) {
      this.finalVerdict.set('maybe');
      this.positiveFeedback.set([
        'Some solid moments showed potential.',
        'Reasonable communication skills.'
      ]);
      this.negativeFeedback.set([
        'Answers lacked depth and specific examples.',
        'Some red flags raised concerns about fit.',
        'Didn\'t fully address the questions asked.'
      ]);
      this.realityCheck.set('On the fence. Might get a callback if other candidates are weak, but not a strong impression.');
    } else {
      this.finalVerdict.set('rejected');
      this.positiveFeedback.set([
        'Showed up and tried.'
      ]);
      this.negativeFeedback.set([
        'Multiple red flags in responses.',
        'Answers were vague or deflective.',
        'Didn\'t demonstrate the required competencies.',
        'Would need significant coaching to be effective.'
      ]);
      this.realityCheck.set('Would not advance. The feedback email would be polite but the decision was made early in the interview.');
    }

    this.isInSession.set(false);
    this.showResults.set(true);
  }

  getMoodEmoji(): string {
    const mood = this.currentMood();
    switch (mood) {
      case 'impressed': return '😊';
      case 'skeptical': return '🤨';
      case 'concerned': return '😐';
      default: return '😶';
    }
  }

  getLevel(value: number): string {
    if (value >= 70) return 'high';
    if (value >= 40) return 'medium';
    return 'low';
  }

  getScoreLevel(score: number): string {
    if (score >= 75) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  getVerdictEmoji(): string {
    switch (this.finalVerdict()) {
      case 'hired': return '🎉';
      case 'maybe': return '🤔';
      case 'rejected': return '😬';
    }
  }

  getVerdictTitle(): string {
    switch (this.finalVerdict()) {
      case 'hired': return 'You\'d Get the Job!';
      case 'maybe': return 'On the Fence';
      case 'rejected': return 'Thanks for Coming In...';
    }
  }

  getVerdictSubtitle(): string {
    switch (this.finalVerdict()) {
      case 'hired': return 'Strong performance - you handled that well.';
      case 'maybe': return 'Some good moments, but concerns remain.';
      case 'rejected': return 'We\'ll be in touch. (We won\'t.)';
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  retryWithSamePersona() {
    this.showResults.set(false);
    this.resetState();
    this.startSession();
  }

  closeResults() {
    this.showResults.set(false);
    this.resetState();
  }

  private resetState() {
    this.thoughts.set([]);
    this.metrics.set({
      confidence: 50,
      clarity: 50,
      relevance: 50,
      authenticity: 50,
      redFlagCount: 0,
      greenFlagCount: 0
    });
    this.elapsedTime.set(0);
    this.currentMood.set('neutral');
    this.userResponse = '';
  }

  ngOnDestroy() {
    clearInterval(this.timerInterval);
    clearInterval(this.thoughtInterval);
    clearInterval(this.elapsedInterval);
  }
}
