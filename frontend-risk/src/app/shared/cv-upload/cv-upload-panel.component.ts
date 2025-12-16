import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InterviewSessionApiService } from '../../core/services/interview-session-api.service';
import { InterviewProfileDto } from '../../core/models/interview-session.model';
import { InterviewProfileStateService } from '../../core/services/interview-profile-state.service';

@Component({
  selector: 'app-cv-upload-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cv-upload-panel.component.html',
  styleUrls: ['./cv-upload-panel.component.scss']
})
export class CvUploadPanelComponent {
  /**
   * When true, the parent can treat CV upload as required before starting
   * an interview. The component itself only surfaces a visual hint.
   */
  @Input() required = false;

  /**
   * Emits whenever a new interview profile has been successfully computed
   * from an uploaded CV.
   */
  @Output() profileLoaded = new EventEmitter<InterviewProfileDto>();

  dragging = false;
  uploading = false;
  uploadSuccess = false;
  error: string | null = null;
  fileName: string | null = null;

  constructor(
    private readonly sessionApi: InterviewSessionApiService,
    private readonly profileState: InterviewProfileStateService
  ) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging = false;

    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.handleFile(file);
    }
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] ?? null;
    if (file) {
      this.handleFile(file);
    }
  }

  private handleFile(file: File): void {
    this.error = null;
    this.uploadSuccess = false;

    if (!this.isSupportedType(file)) {
      this.error = 'Supported formats: PDF, DOC, DOCX, TXT.';
      return;
    }

    // Basic size guard to avoid accidental huge uploads.
    const maxBytes = 8 * 1024 * 1024; // 8 MB
    if (file.size > maxBytes) {
      this.error = 'File is too large. Please upload a CV up to 8 MB.';
      return;
    }

    this.fileName = file.name;
    this.uploading = true;

    this.sessionApi.uploadCv(file).subscribe({
      next: (profile: InterviewProfileDto) => {
        this.uploading = false;
        this.uploadSuccess = true;
        this.error = null;

        // Store shared state for candidate + interviewer views.
        this.profileState.setProfile(profile);
        this.profileLoaded.emit(profile);
      },
      error: () => {
        this.uploading = false;
        this.uploadSuccess = false;
        this.error =
          'Failed to process CV. Please try again or continue without CV.';
      }
    });
  }

  private isSupportedType(file: File): boolean {
    const ext = file.name.toLowerCase();
    if (
      ext.endsWith('.pdf') ||
      ext.endsWith('.doc') ||
      ext.endsWith('.docx') ||
      ext.endsWith('.txt')
    ) {
      return true;
    }

    const type = (file.type || '').toLowerCase();
    return (
      type === 'application/pdf' ||
      type === 'application/msword' ||
      type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      type === 'text/plain'
    );
  }
}





