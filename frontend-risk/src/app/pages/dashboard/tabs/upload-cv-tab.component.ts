import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvUploadPanelComponent } from '../../../shared/cv-upload/cv-upload-panel.component';
import { InterviewProfileDto } from '../../../core/models/interview-session.model';

@Component({
  selector: 'app-upload-cv-tab',
  standalone: true,
  imports: [CommonModule, CvUploadPanelComponent],
  templateUrl: './upload-cv-tab.component.html',
  styleUrls: ['./upload-cv-tab.component.scss']
})
export class UploadCvTabComponent {
  @Input() loading = false;
  @Output() uploaded = new EventEmitter<void>();

  onProfileLoaded(_profile: InterviewProfileDto): void {
    this.uploaded.emit();
  }
}





