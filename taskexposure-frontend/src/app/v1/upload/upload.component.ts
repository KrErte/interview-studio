import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
      <h1 class="text-3xl font-bold text-white mb-4">Upload Your CV</h1>
      <p class="text-gray-400 mb-8">We'll analyze your experience to give you an accurate assessment.</p>

      <div
        class="border-2 border-dashed border-gray-700 rounded-lg p-12 text-center cursor-pointer hover:border-emerald-500 transition-colors"
        (click)="fileInput.click()"
      >
        <input #fileInput type="file" accept=".pdf,.doc,.docx,.txt" class="hidden" (change)="onFileSelected($event)" />
        <p class="text-gray-400">
          {{ fileName || 'Click to upload or drag and drop' }}
        </p>
        <p class="text-gray-600 text-sm mt-2">PDF, DOC, DOCX, or TXT</p>
      </div>

      <div class="flex gap-4 mt-8">
        <button
          (click)="continue()"
          [disabled]="!fileName"
          class="bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-colors"
        >
          Continue
        </button>
        <button
          (click)="useSampleCv()"
          class="bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-3 px-8 rounded-lg transition-colors border border-gray-600"
        >
          Use Sample CV
        </button>
      </div>
    </div>
  `,
})
export class UploadComponent {
  fileName = '';

  constructor(private router: Router) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fileName = input.files[0].name;
      // TODO: Call /api/taskexposure/upload-cv
    }
  }

  continue(): void {
    // TODO: Store CV text in session/service
    this.router.navigate(['/questionnaire']);
  }

  useSampleCv(): void {
    this.fileName = 'sample-cv.pdf';
    // Mock CV data stored in session (TODO: implement service)
    this.router.navigate(['/questionnaire']);
  }
}
