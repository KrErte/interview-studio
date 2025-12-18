import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  MindsetRoadmapDetail,
  MindsetRoadmapSummary,
  TrainingTaskRequest
} from '../models/mindset-roadmap.models';   // <── NB! ../models, mitte ./models

@Injectable({
  providedIn: 'root'
})
export class MindsetRoadmapService {

  private readonly baseUrl = 'http://localhost:8080/api/mindset';

  constructor(private http: HttpClient) {}

  getRoadmaps(email: string): Observable<MindsetRoadmapSummary[]> {
    const params = new HttpParams().set('email', email);
    return this.http.get<MindsetRoadmapSummary[]>(`${this.baseUrl}/roadmaps`, { params });
  }

  getRoadmapDetail(email: string, roadmapKey: string): Observable<MindsetRoadmapDetail> {
    const params = new HttpParams().set('email', email);
    return this.http.get<MindsetRoadmapDetail>(`${this.baseUrl}/roadmaps/${roadmapKey}`, { params });
  }

  updateTask(request: TrainingTaskRequest): Observable<MindsetRoadmapDetail> {
    return this.http.post<MindsetRoadmapDetail>(`${this.baseUrl}/task`, request);
  }

  /**
   * Export a single roadmap to Markdown format.
   * Downloads the file automatically via browser.
   */
  exportRoadmapToMarkdown(email: string, roadmapKey: string): void {
    const params = new HttpParams().set('email', email);
    const url = `${this.baseUrl}/roadmaps/${roadmapKey}/export/markdown`;

    this.http.get(url, {
      params,
      responseType: 'blob',
      observe: 'response'
    }).subscribe(response => {
      this.downloadFile(response.body!, this.extractFilename(response, `roadmap-${roadmapKey}.md`));
    });
  }

  /**
   * Export all roadmaps to a single Markdown document.
   * Downloads the file automatically via browser.
   */
  exportAllRoadmapsToMarkdown(email: string): void {
    const params = new HttpParams().set('email', email);
    const url = `${this.baseUrl}/roadmaps/export/markdown`;

    this.http.get(url, {
      params,
      responseType: 'blob',
      observe: 'response'
    }).subscribe(response => {
      this.downloadFile(response.body!, this.extractFilename(response, 'roadmaps-export.md'));
    });
  }

  /**
   * Preview markdown export (returns raw markdown text).
   */
  previewRoadmapMarkdown(email: string, roadmapKey: string): Observable<string> {
    const params = new HttpParams().set('email', email);
    return this.http.get(`${this.baseUrl}/roadmaps/${roadmapKey}/export/markdown/preview`, {
      params,
      responseType: 'text'
    });
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  private extractFilename(response: any, defaultName: string): string {
    const contentDisposition = response.headers?.get('content-disposition');
    if (contentDisposition) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
      if (matches && matches[1]) {
        return matches[1].replace(/['"]/g, '');
      }
    }
    return defaultName;
  }
}
