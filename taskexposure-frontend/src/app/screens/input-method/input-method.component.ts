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

import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CopyService } from '../../core/services/copy.service';

@Component({
  selector: 'app-input-method',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input-method.component.html',
  styleUrl: './input-method.component.scss',
})
export class InputMethodComponent {
  private copyService = inject(CopyService);

  @Output() selectManual = new EventEmitter<void>();

  get copy() {
    return this.copyService.inputMethodCopy;
  }

  onSelectManual(): void {
    this.selectManual.emit();
  }
}
