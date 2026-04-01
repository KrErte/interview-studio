import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

const DEFAULTS = {
  title: 'CareerRisk — Is Your Career at Risk from AI?',
  description: 'Free 3-minute AI career risk assessment. Find out if your job is at risk and get a personalized action plan.',
  image: 'https://careerrisk.ee/assets/og-image.png',
  url: 'https://careerrisk.ee/'
};

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(private title: Title, private meta: Meta) {}

  updateMeta(opts: { title?: string; description?: string; ogImage?: string; url?: string } = {}) {
    const t = opts.title || DEFAULTS.title;
    const d = opts.description || DEFAULTS.description;
    const img = opts.ogImage || DEFAULTS.image;
    const url = opts.url || DEFAULTS.url;

    this.title.setTitle(t);
    this.meta.updateTag({ name: 'description', content: d });
    this.meta.updateTag({ property: 'og:title', content: t });
    this.meta.updateTag({ property: 'og:description', content: d });
    this.meta.updateTag({ property: 'og:image', content: img });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
  }

  resetToDefaults() {
    this.updateMeta();
  }
}
