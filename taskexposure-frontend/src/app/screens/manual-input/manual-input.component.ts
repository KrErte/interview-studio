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

import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CopyService } from '../../core/services/copy.service';

@Component({
  selector: 'app-manual-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manual-input.component.html',
  styleUrl: './manual-input.component.scss',
})
export class ManualInputComponent {
  private copyService = inject(CopyService);

  @Input() isLoading = false;
  @Output() tasksSubmitted = new EventEmitter<string[]>();

  get copy() {
    return this.copyService.manualInputCopy;
  }

  tasks: string[] = [];
  currentTask: string = '';

  get canAddTask(): boolean {
    return this.currentTask.trim().length > 0 && this.tasks.length < 5;
  }

  get canContinue(): boolean {
    return this.tasks.length >= 3;
  }

  get taskCounter(): string {
    return this.copy.counter(this.tasks.length, 3, 5);
  }

  addTask(): void {
    if (this.canAddTask) {
      this.tasks.push(this.currentTask.trim());
      this.currentTask = '';
    }
  }

  removeTask(index: number): void {
    this.tasks.splice(index, 1);
  }

  onContinue(): void {
    if (this.canContinue) {
      this.tasksSubmitted.emit(this.tasks);
    }
  }
}
