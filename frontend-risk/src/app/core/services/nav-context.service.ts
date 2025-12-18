import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export type NavMode = 'default' | 'futureproof';

export interface NavItem {
  label: string;
  key: string;
}

export interface NavState {
  mode: NavMode;
  items: NavItem[];
}

@Injectable({
  providedIn: 'root'
})
export class NavContextService {
  private stateSubject = new BehaviorSubject<NavState>({ mode: 'default', items: [] });
  readonly state$ = this.stateSubject.asObservable();

  private commandsSubject = new Subject<string>();
  readonly commands$ = this.commandsSubject.asObservable();

  private activeKeySubject = new BehaviorSubject<string | null>(null);
  readonly activeKey$ = this.activeKeySubject.asObservable();

  setFutureproofNav(items: NavItem[]): void {
    this.stateSubject.next({ mode: 'futureproof', items });
    if (items.length) {
      this.activeKeySubject.next(items[0].key);
    }
  }

  resetNav(): void {
    this.stateSubject.next({ mode: 'default', items: [] });
    this.activeKeySubject.next(null);
  }

  emitCommand(key: string): void {
    this.commandsSubject.next(key);
  }

  setActiveKey(key: string | null): void {
    this.activeKeySubject.next(key);
  }
}

