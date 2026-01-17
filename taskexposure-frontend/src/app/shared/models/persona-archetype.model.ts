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

/**
 * Persona Engine v1 - Future Role Archetypes
 *
 * Based on signal combinations, users are mapped to one of five future role archetypes.
 * These are trajectory indicators, not predictions.
 */

export type PersonaArchetypeId =
  | 'ai-orchestrator'
  | 'judgment-specialist'
  | 'relationship-anchor'
  | 'hybrid-professional'
  | 'transition-candidate';

export interface PersonaArchetype {
  id: PersonaArchetypeId;
  name: string;
  signalProfile: string;
  futurePosition: string;
  description: string;
  color: 'emerald' | 'blue' | 'purple' | 'amber' | 'rose';
}

export const PERSONA_ARCHETYPES: Record<PersonaArchetypeId, PersonaArchetype> = {
  'ai-orchestrator': {
    id: 'ai-orchestrator',
    name: 'AI Orchestrator',
    signalProfile: 'High orchestration, moderate routine',
    futurePosition: 'Directs AI systems, quality control, exception handling',
    description:
      'You coordinate complex workflows and manage AI outputs. Your value lies in knowing when to trust automation and when to intervene.',
    color: 'blue',
  },
  'judgment-specialist': {
    id: 'judgment-specialist',
    name: 'Judgment Specialist',
    signalProfile: 'High ambiguity, high accountability, high novelty',
    futurePosition: 'Makes calls AI cannot, handles ambiguous situations',
    description:
      'You handle situations where the right answer is unclear. Your experience and instincts guide decisions that algorithms cannot make.',
    color: 'emerald',
  },
  'relationship-anchor': {
    id: 'relationship-anchor',
    name: 'Relationship Anchor',
    signalProfile: 'High trust dependency, moderate orchestration',
    futurePosition: 'Human face of organization, trust-based interactions',
    description:
      'You are the human connection in a digital world. Clients and colleagues trust you because relationships cannot be automated.',
    color: 'purple',
  },
  'hybrid-professional': {
    id: 'hybrid-professional',
    name: 'Hybrid Professional',
    signalProfile: 'Balanced signals across dimensions',
    futurePosition: 'Mix of AI-assisted and human-exclusive work',
    description:
      'Your work spans multiple domains. Some tasks will shift to AI, others will remain yours. Flexibility is your advantage.',
    color: 'amber',
  },
  'transition-candidate': {
    id: 'transition-candidate',
    name: 'Transition Candidate',
    signalProfile: 'High routine, low ambiguity, low accountability',
    futurePosition: 'Work highly automatable—active repositioning needed',
    description:
      'Much of your current work follows predictable patterns. The roadmap below focuses on repositioning toward higher-judgment activities.',
    color: 'rose',
  },
};

/**
 * Signal taxonomy for task analysis.
 * Each signal exists on a spectrum, not as binary present/absent.
 */
export interface SignalProfile {
  routineDensity: number; // 0-100: High = High exposure
  decisionAmbiguity: number; // 0-100: High = Low exposure
  trustDependency: number; // 0-100: High = Low exposure
  novelContextFrequency: number; // 0-100: High = Low exposure
  accountabilityWeight: number; // 0-100: High = Low exposure
  orchestrationLoad: number; // 0-100: High = Low exposure
}

/**
 * Task category for breakdown screen.
 * Each task is assigned to one of three future-role categories.
 */
export type TaskCategory = 'automated' | 'ai-assisted' | 'human-moat';

export interface TaskCategoryInfo {
  id: TaskCategory;
  label: string;
  meaning: string;
  userAction: string;
  color: 'rose' | 'amber' | 'emerald';
}

export const TASK_CATEGORIES: Record<TaskCategory, TaskCategoryInfo> = {
  automated: {
    id: 'automated',
    label: 'Automated',
    meaning: 'AI already does this reliably. Task likely disappears within 1-3 years.',
    userAction: 'Delegate to AI now. Reclaim time for higher-value work.',
    color: 'rose',
  },
  'ai-assisted': {
    id: 'ai-assisted',
    label: 'AI-Assisted',
    meaning:
      'AI does heavy lifting, human oversight needed. Role shifts from creator to editor.',
    userAction: 'Learn to orchestrate AI. Move value from execution to judgment.',
    color: 'amber',
  },
  'human-moat': {
    id: 'human-moat',
    label: 'Human Moat',
    meaning:
      'Requires trust, accountability, or ambiguity AI cannot handle. Protected 5+ years.',
    userAction: 'Expand and deepen. Make this larger share of your work.',
    color: 'emerald',
  },
};

/**
 * Derive persona archetype from exposure score and signal profile.
 * TODO: Backend should provide this based on actual signal analysis.
 */
export function derivePersonaArchetype(
  exposureScore: number,
  signalProfile?: Partial<SignalProfile>
): PersonaArchetypeId {
  // Placeholder logic - in production, this should come from backend
  if (exposureScore >= 70) {
    return 'transition-candidate';
  }
  if (exposureScore >= 50) {
    return 'hybrid-professional';
  }
  if (signalProfile?.orchestrationLoad && signalProfile.orchestrationLoad > 60) {
    return 'ai-orchestrator';
  }
  if (signalProfile?.trustDependency && signalProfile.trustDependency > 60) {
    return 'relationship-anchor';
  }
  return 'judgment-specialist';
}

/**
 * Map task exposure to task category.
 */
export function mapExposureToCategory(exposure: 'high' | 'medium' | 'low'): TaskCategory {
  if (exposure === 'high') return 'automated';
  if (exposure === 'medium') return 'ai-assisted';
  return 'human-moat';
}
