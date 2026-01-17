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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
  disabled?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @Input() currentScreen = '';
  @Input() collapsed = false;
  @Output() navigate = new EventEmitter<string>();
  @Output() toggleCollapse = new EventEmitter<void>();

  navItems: NavItem[] = [
    { id: 'entry', label: 'Start', icon: 'home' },
    { id: 'manual-input', label: 'Tasks', icon: 'edit' },
    { id: 'clarifying-questions', label: 'Questions', icon: 'help' },
    { id: 'assessment-justification', label: 'Analysis', icon: 'analytics' },
    { id: 'risk-score', label: 'Score', icon: 'speed' },
    { id: 'risk-breakdown', label: 'Breakdown', icon: 'pie_chart' },
    { id: 'roadmap', label: 'Roadmap', icon: 'map' },
    { id: 'summary', label: 'Summary', icon: 'summarize' },
  ];

  toolItems: NavItem[] = [
    { id: 'evidence-log', label: 'Evidence Log', icon: 'note_add' },
  ];

  onNavigate(id: string): void {
    this.navigate.emit(id);
  }

  onToggleCollapse(): void {
    this.toggleCollapse.emit();
  }

  getStepNumber(id: string): number {
    return this.navItems.findIndex(item => item.id === id) + 1;
  }

  isStepCompleted(id: string): boolean {
    const currentIndex = this.navItems.findIndex(item => item.id === this.currentScreen);
    const itemIndex = this.navItems.findIndex(item => item.id === id);
    return itemIndex < currentIndex;
  }

  isStepActive(id: string): boolean {
    return this.currentScreen === id;
  }
}
