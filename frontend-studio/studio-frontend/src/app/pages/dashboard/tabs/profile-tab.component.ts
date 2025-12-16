import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-tab.component.html',
  styleUrls: ['./profile-tab.component.scss']
})
export class ProfileTabComponent {
  @Input() loading = false;
  @Input() profileSummary: string | null = null;
  @Input() cvSummary: string | null = null;
  @Input() skillProfileSummary: string | null = null;

  get hasContent(): boolean {
    return !!(this.profileSummary || this.cvSummary || this.skillProfileSummary);
  }
}


