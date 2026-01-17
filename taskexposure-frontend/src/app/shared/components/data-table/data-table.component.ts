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
import { ScoreBarComponent } from '../score-bar/score-bar.component';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'badge' | 'score' | 'score-bar';
  width?: string;
}

export interface TableRow {
  id: string;
  [key: string]: unknown;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, ScoreBarComponent],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
})
export class DataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() rows: TableRow[] = [];
  @Input() selectedRowId: string | null = null;
  @Input() emptyMessage = 'No data available';
  @Output() rowClick = new EventEmitter<TableRow>();
  @Output() rowSelect = new EventEmitter<TableRow>();

  onRowClick(row: TableRow): void {
    this.rowClick.emit(row);
  }

  getCellValue(row: TableRow, column: TableColumn): unknown {
    return row[column.key];
  }

  getBadgeClass(value: unknown): string {
    const val = String(value).toLowerCase();
    if (val === 'high' || val === 'error' || val === 'failed' || val === 'stuck') {
      return 'status-badge--error';
    }
    if (val === 'medium' || val === 'warning' || val === 'pending') {
      return 'status-badge--warning';
    }
    if (val === 'low' || val === 'success' || val === 'completed') {
      return 'status-badge--success';
    }
    return 'status-badge--neutral';
  }

  getScoreColor(value: unknown): 'low' | 'medium' | 'high' {
    const num = Number(value) || 0;
    if (num <= 33) return 'low';
    if (num <= 66) return 'medium';
    return 'high';
  }
}
