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

/**
 * Get ISO week number for a given date
 * @param date - The date to calculate the week number for
 * @returns The ISO week number (1-53)
 */
export function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Get the ISO week year for a given date
 * The ISO week year may differ from the calendar year at year boundaries
 * @param date - The date to calculate the week year for
 * @returns The ISO week year
 */
export function getISOWeekYear(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  return d.getUTCFullYear();
}

/**
 * Generate a week key in ISO format (e.g., "2025-W52")
 * @param date - The date or ISO string
 * @returns Week key string in format "YYYY-Www"
 */
export function getWeekKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = getISOWeekYear(d);
  const week = getISOWeekNumber(d);
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

/**
 * Format a date for display (e.g., "Dec 22, 2025")
 * @param date - The date or ISO string
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, locale: string = 'en-US'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a date with week label (e.g., "Dec 22, 2025 · Week 52")
 * @param date - The date or ISO string
 * @param locale - The locale to use for formatting
 * @returns Formatted date string with week
 */
export function formatDateWithWeek(date: Date | string, locale: string = 'en-US'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const formattedDate = formatDate(d, locale);
  const weekNum = getISOWeekNumber(d);
  return `${formattedDate} · Week ${weekNum}`;
}

/**
 * Get the start of day for a given date
 * @param date - The date
 * @returns Date at start of day (00:00:00.000)
 */
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the date N days ago from a given date
 * @param days - Number of days to subtract
 * @param from - Starting date (default: now)
 * @returns Date N days ago
 */
export function daysAgo(days: number, from: Date = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() - days);
  return d;
}

/**
 * Check if a date is within the last N days
 * @param date - The date to check
 * @param days - Number of days
 * @returns True if the date is within the last N days
 */
export function isWithinLastDays(date: Date | string, days: number): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const threshold = daysAgo(days);
  return d >= startOfDay(threshold);
}

/**
 * Generate a UUID v4
 * @returns A UUID v4 string
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
