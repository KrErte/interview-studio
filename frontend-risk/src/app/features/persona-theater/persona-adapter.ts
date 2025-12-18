export type PersonaStyle = 'COACH' | 'SKEPTIC' | 'PRAGMATIST' | 'BALANCED';

export interface ObserverExplanationInput {
  delta?: number | null;
  reason?: string | null;
  signals?: string[] | null;
}

export function adaptObserverExplanation(entry: ObserverExplanationInput, persona: PersonaStyle): string {
  const delta = entry.delta ?? 0;
  const reason = (entry.reason ?? '').trim();
  const signals = (entry.signals ?? []).filter(Boolean);
  const direction = delta === 0 ? 'unchanged' : delta > 0 ? 'increased' : 'decreased';
  const coreReason = reason || (signals.length ? signals[0] : 'This change was based on the latest answer.');

  switch (persona) {
    case 'SKEPTIC':
      return skepticExplanation(direction, coreReason, signals);
    case 'PRAGMATIST':
      return pragmatistExplanation(signals);
    case 'BALANCED':
      return balancedExplanation(direction, coreReason);
    case 'COACH':
    default:
      return coachExplanation(direction, coreReason);
  }
}

function coachExplanation(direction: string, reason: string): string {
  return `The score ${direction} because ${reason}. This is fixable—focus on tightening this area in your next answer.`;
}

function skepticExplanation(direction: string, reason: string, signals: string[]): string {
  const uncertainty = signals.length === 0 ? ' Evidence is limited, so confidence is low.' : '';
  return `The score ${direction} due to ${reason}.${uncertainty}`;
}

function pragmatistExplanation(signals: string[]): string {
  const steps = signals.slice(0, 3);
  const items =
    steps.length > 0
      ? steps
      : ['Add one concrete example', 'State your specific role', 'Quantify the outcome'];
  return items.map((s) => `• ${s}`).join('\n');
}

function balancedExplanation(direction: string, reason: string): string {
  return `The score ${direction} because ${reason}.`;
}

