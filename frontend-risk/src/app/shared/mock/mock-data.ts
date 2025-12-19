export interface MockProfile {
  years: number;
  role: string;
  seniority: 'Junior' | 'Mid' | 'Senior' | 'Lead';
  industry: string;
  stack: string;
}

export function buildMockProfile(): MockProfile {
  return {
    years: 7,
    role: 'Senior Frontend Engineer',
    seniority: 'Senior',
    industry: 'FinTech',
    stack: 'Angular, TypeScript, RxJS, Node.js, PostgreSQL, AWS'
  };
}

export function buildMockAnswer(question: string, profile: MockProfile): string {
  const base = `I'm a ${profile.seniority.toLowerCase()} ${profile.role.toLowerCase()} working in ${profile.industry}. `;
  const craft = [
    `I recently handled a case where ${question.toLowerCase()}.`,
    `I approached it by framing the problem, aligning stakeholders, and delivering an incremental solution.`,
    `Tech stack: ${profile.stack}.`,
    `Outcome: measurable impact, reduced risk, and improved collaboration.`
  ];
  return [base, ...craft].join(' ');
}

