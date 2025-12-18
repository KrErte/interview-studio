export type PersonaId = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7';

export interface Persona {
  id: PersonaId;
  emoji: string;
  name: string;
  tagline: [string, string];
}

