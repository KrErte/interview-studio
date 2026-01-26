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
import { JobMarketService } from '../../core/services/job-market.service';

@Component({
  selector: 'app-job-market-cv-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-market-cv-upload.component.html',
  styleUrl: './job-market-cv-upload.component.scss',
})
export class JobMarketCvUploadComponent {
  private jobMarketService = inject(JobMarketService);

  @Output() continue = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  isDragOver = false;
  uploadedFile: File | null = null;
  isProcessing = false;
  errorMessage = '';

  readonly acceptedTypes = ['application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
  readonly maxSize = 8 * 1024 * 1024; // 8 MB

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    this.errorMessage = '';

    if (!this.acceptedTypes.includes(file.type)) {
      this.errorMessage = 'Please upload a PDF, DOC, DOCX, or TXT file.';
      return;
    }

    if (file.size > this.maxSize) {
      this.errorMessage = 'File size must be under 8 MB.';
      return;
    }

    this.uploadedFile = file;
    this.processFile(file);
  }

  private async processFile(file: File): Promise<void> {
    this.isProcessing = true;

    try {
      // For now, we'll just store the filename
      // In a real implementation, this would send to backend for text extraction
      const text = await this.extractText(file);
      this.jobMarketService.setCvData(file.name, text);
      this.isProcessing = false;
    } catch {
      this.errorMessage = 'Failed to process file. Please try again.';
      this.isProcessing = false;
      this.uploadedFile = null;
    }
  }

  private async extractText(file: File): Promise<string> {
    // Simple text extraction for TXT files
    // For PDF/DOC, this would be handled by backend
    if (file.type === 'text/plain') {
      return await file.text();
    }
    // Return placeholder for other file types
    // In production, this would call backend API
    return `CV content from: ${file.name}`;
  }

  removeFile(): void {
    this.uploadedFile = null;
    this.errorMessage = '';
  }

  onContinue(): void {
    if (this.uploadedFile && !this.isProcessing) {
      this.continue.emit();
    }
  }

  onBack(): void {
    this.back.emit();
  }
}
