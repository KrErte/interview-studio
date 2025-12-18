/**
 * Roadmap Markdown Export Utility
 *
 * Provides client-side markdown generation for roadmap data.
 * Can be used as fallback when backend export is unavailable.
 *
 * Markdown Format Specification:
 * =============================
 *
 * # {Roadmap Title}
 *
 * **Progress:** {completedTasks}/{totalTasks} ({progressPercent}%)
 * **Generated:** {timestamp}
 *
 * ---
 *
 * ## Tasks
 *
 * - [x] Task Title - Description (Day 1)
 * - [ ] Task Title - Description (Day 2)
 *
 * ---
 *
 * ## Summary
 *
 * | Metric | Value |
 * |--------|-------|
 * | Total Tasks | 10 |
 * | Completed | 7 |
 * | Progress | 70% |
 */

export interface RoadmapExportTask {
  taskKey?: string;
  title?: string;
  description?: string;
  completed: boolean;
  dayNumber?: number;
  score?: number | null;
  updatedAt?: string | null;
}

export interface RoadmapExportData {
  title: string;
  tasks: RoadmapExportTask[];
  roadmapKey?: string;
}

/**
 * Generates markdown content from roadmap data.
 */
export function generateRoadmapMarkdown(data: RoadmapExportData): string {
  const lines: string[] = [];
  const timestamp = new Date().toISOString().split('T')[0];

  // Calculate progress
  const totalTasks = data.tasks.length;
  const completedTasks = data.tasks.filter(t => t.completed).length;
  const progressPercent = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  // Header
  lines.push(`# ${data.title}`);
  lines.push('');
  lines.push(`**Progress:** ${completedTasks}/${totalTasks} (${progressPercent}%)`);
  lines.push(`**Generated:** ${timestamp}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Progress bar
  lines.push(createProgressBar(progressPercent));
  lines.push('');

  // Tasks section
  lines.push('## Tasks');
  lines.push('');

  if (data.tasks.length > 0) {
    for (const task of data.tasks) {
      lines.push(formatTask(task));
    }
  } else {
    lines.push('_No tasks available._');
  }

  lines.push('');
  lines.push('---');
  lines.push('');

  // Summary table
  lines.push('## Summary');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  if (data.roadmapKey) {
    lines.push(`| Roadmap Key | ${data.roadmapKey} |`);
  }
  lines.push(`| Total Tasks | ${totalTasks} |`);
  lines.push(`| Completed | ${completedTasks} |`);
  lines.push(`| Progress | ${progressPercent}% |`);
  lines.push('');

  return lines.join('\n');
}

/**
 * Generates markdown for multiple roadmaps.
 */
export function generateAllRoadmapsMarkdown(roadmaps: RoadmapExportData[]): string {
  const lines: string[] = [];
  const timestamp = new Date().toISOString().split('T')[0];

  // Document header
  lines.push('# Training Roadmaps Overview');
  lines.push('');
  lines.push(`**Generated:** ${timestamp}`);
  lines.push('');

  // Overall statistics
  const totalTasks = roadmaps.reduce((sum, r) => sum + r.tasks.length, 0);
  const completedTasks = roadmaps.reduce(
    (sum, r) => sum + r.tasks.filter(t => t.completed).length,
    0
  );
  const overallPercent = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  lines.push('## Overall Progress');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  lines.push(`| Total Roadmaps | ${roadmaps.length} |`);
  lines.push(`| Total Tasks | ${totalTasks} |`);
  lines.push(`| Completed Tasks | ${completedTasks} |`);
  lines.push(`| Overall Progress | ${overallPercent}% |`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Individual roadmaps
  for (const roadmap of roadmaps) {
    lines.push(generateRoadmapSection(roadmap));
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Downloads markdown content as a file.
 */
export function downloadMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * Helper: Format a single task as markdown checkbox.
 */
function formatTask(task: RoadmapExportTask): string {
  const checkbox = task.completed ? '[x]' : '[ ]';
  const title = task.title || formatTaskKey(task.taskKey || 'Unknown');
  const dayInfo = task.dayNumber ? ` (Day ${task.dayNumber})` : '';

  let metadata = '';
  const metaParts: string[] = [];

  if (task.score != null && task.score > 0) {
    metaParts.push(`Score: ${task.score}`);
  }
  if (task.updatedAt) {
    metaParts.push(`Updated: ${formatDate(task.updatedAt)}`);
  }

  if (metaParts.length > 0) {
    metadata = ` _(${metaParts.join(', ')})_`;
  }

  const description = task.description ? ` - ${truncate(task.description, 80)}` : '';

  return `- ${checkbox} **${title}**${description}${dayInfo}${metadata}`;
}

/**
 * Helper: Generate a section for one roadmap.
 */
function generateRoadmapSection(data: RoadmapExportData): string {
  const lines: string[] = [];
  const totalTasks = data.tasks.length;
  const completedTasks = data.tasks.filter(t => t.completed).length;
  const progressPercent = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  lines.push(`### ${data.title}`);
  lines.push('');
  lines.push(createProgressBar(progressPercent));
  lines.push('');

  if (data.tasks.length > 0) {
    for (const task of data.tasks) {
      lines.push(formatTask(task));
    }
  } else {
    lines.push('_No tasks available._');
  }

  return lines.join('\n');
}

/**
 * Helper: Create a text-based progress bar.
 */
function createProgressBar(percent: number): string {
  const filled = Math.floor(percent / 10);
  const empty = 10 - filled;
  return `Progress: \`[${'█'.repeat(filled)}${'░'.repeat(empty)}]\` ${percent}%`;
}

/**
 * Helper: Format task key to title case.
 */
function formatTaskKey(taskKey: string): string {
  if (!taskKey) return 'Unknown Task';

  return taskKey
    .replace(/[_-]/g, ' ')
    .split(' ')
    .filter(p => p.length > 0)
    .map(p => {
      if (/^\d+$/.test(p)) return p;
      return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Helper: Format ISO date to short format.
 */
function formatDate(isoDate: string): string {
  if (!isoDate) return '';
  try {
    const date = new Date(isoDate);
    return date.toISOString().split('T')[0];
  } catch {
    return isoDate;
  }
}

/**
 * Helper: Truncate text with ellipsis.
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}
