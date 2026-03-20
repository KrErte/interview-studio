import { Injectable } from '@angular/core';

interface StreakData {
  count: number;
  lastDate: string;
}

@Injectable({ providedIn: 'root' })
export class StreakService {
  private readonly KEY = 'is.streak';

  get count(): number {
    return this.load().count;
  }

  /** Call whenever user does meaningful activity (starts interview, submits answer, completes practice). */
  recordActivity(): void {
    const data = this.load();
    const today = this.dateKey(0);
    if (data.lastDate === today) return; // already recorded today
    const yesterday = this.dateKey(-1);
    data.count = data.lastDate === yesterday ? data.count + 1 : 1;
    data.lastDate = today;
    try { localStorage.setItem(this.KEY, JSON.stringify(data)); } catch { /* storage unavailable */ }
  }

  private load(): StreakData {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) return JSON.parse(raw) as StreakData;
    } catch { /* ignore */ }
    return { count: 0, lastDate: '' };
  }

  private dateKey(offsetDays: number): string {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  }
}
