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

import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type SupportedLanguage = 'en' | 'et';

interface TranslationData {
  [key: string]: string | TranslationData;
}

/**
 * TranslationService - Lightweight i18n for TASKEXPOSURE
 *
 * Loads JSON translation files from assets/i18n/
 * Supports nested keys (e.g., 'start.headline')
 * Default language: English (en)
 */
@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private translations = signal<TranslationData>({});
  private currentLang = signal<SupportedLanguage>('en');
  private isLoaded = signal<boolean>(false);

  readonly language = computed(() => this.currentLang());
  readonly loaded = computed(() => this.isLoaded());

  constructor(private http: HttpClient) {
    this.loadLanguage(this.detectLanguage());
  }

  /**
   * Detect user's preferred language from browser settings
   */
  private detectLanguage(): SupportedLanguage {
    const browserLang = navigator.language?.split('-')[0];
    if (browserLang === 'et') {
      return 'et';
    }
    return 'en';
  }

  /**
   * Load translation file for specified language
   */
  async loadLanguage(lang: SupportedLanguage): Promise<void> {
    try {
      const translations = await firstValueFrom(
        this.http.get<TranslationData>(`/assets/i18n/${lang}.json`)
      );
      this.translations.set(translations);
      this.currentLang.set(lang);
      this.isLoaded.set(true);
    } catch (error) {
      console.error(`Failed to load translations for ${lang}:`, error);
      // Fallback to English if Estonian fails
      if (lang !== 'en') {
        await this.loadLanguage('en');
      }
    }
  }

  /**
   * Switch to a different language
   */
  async setLanguage(lang: SupportedLanguage): Promise<void> {
    if (lang !== this.currentLang()) {
      await this.loadLanguage(lang);
      // Store preference
      localStorage.setItem('taskexposure_lang', lang);
    }
  }

  /**
   * Get translation by key (supports dot notation for nested keys)
   * Example: t('start.headline') or t('score.band.protected.label')
   *
   * @param key - The translation key
   * @param params - Optional parameters for interpolation (e.g., {score: 42})
   */
  t(key: string, params?: Record<string, string | number>): string {
    const value = this.getNestedValue(this.translations(), key);

    if (value === undefined) {
      console.warn(`Translation missing: ${key}`);
      return key;
    }

    if (typeof value !== 'string') {
      console.warn(`Translation key "${key}" is not a string`);
      return key;
    }

    // Handle parameter interpolation: {{param}}
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey) => {
        return params[paramKey]?.toString() ?? `{{${paramKey}}}`;
      });
    }

    return value;
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: TranslationData, path: string): string | TranslationData | undefined {
    const keys = path.split('.');
    let current: string | TranslationData | undefined = obj;

    for (const key of keys) {
      if (current === undefined || typeof current === 'string') {
        return undefined;
      }
      current = current[key];
    }

    return current;
  }

  /**
   * Get all translations for a section (returns object)
   */
  getSection(key: string): TranslationData | undefined {
    const value = this.getNestedValue(this.translations(), key);
    if (typeof value === 'object') {
      return value;
    }
    return undefined;
  }
}
