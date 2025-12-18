package ee.kerrete.ainterview.service;

import ee.kerrete.ainterview.dto.MindsetRoadmapDetail;
import ee.kerrete.ainterview.dto.MindsetRoadmapSummary;
import ee.kerrete.ainterview.dto.MindsetTaskDto;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Service for exporting roadmaps to Markdown format.
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
 * - [x] task_key_1 (Score: 85, Updated: 2024-01-15)
 * - [ ] task_key_2
 * - [x] task_key_3 (Score: 92)
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
@Service
public class RoadmapMarkdownExporter {

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    /**
     * Exports a single roadmap to Markdown format.
     */
    public String exportToMarkdown(MindsetRoadmapDetail detail) {
        StringBuilder md = new StringBuilder();
        MindsetRoadmapSummary summary = detail.getSummary();

        // Header
        md.append("# ").append(summary.getTitle()).append("\n\n");

        // Progress info
        md.append("**Progress:** ")
          .append(summary.getCompletedTasks())
          .append("/")
          .append(summary.getTotalTasks())
          .append(" (")
          .append(summary.getProgressPercent())
          .append("%)\n");

        md.append("**Generated:** ")
          .append(LocalDateTime.now().format(DATE_FORMATTER))
          .append("\n\n");

        md.append("---\n\n");

        // Tasks section
        md.append("## Tasks\n\n");

        if (detail.getTasks() != null && !detail.getTasks().isEmpty()) {
            for (MindsetTaskDto task : detail.getTasks()) {
                md.append(formatTask(task)).append("\n");
            }
        } else {
            md.append("_No tasks available._\n");
        }

        md.append("\n---\n\n");

        // Summary table
        md.append("## Summary\n\n");
        md.append("| Metric | Value |\n");
        md.append("|--------|-------|\n");
        md.append("| Roadmap Key | ").append(summary.getRoadmapKey()).append(" |\n");
        md.append("| Total Tasks | ").append(summary.getTotalTasks()).append(" |\n");
        md.append("| Completed | ").append(summary.getCompletedTasks()).append(" |\n");
        md.append("| Progress | ").append(summary.getProgressPercent()).append("% |\n");

        return md.toString();
    }

    /**
     * Exports multiple roadmaps to a single Markdown document.
     */
    public String exportAllToMarkdown(List<MindsetRoadmapDetail> roadmaps, String email) {
        StringBuilder md = new StringBuilder();

        // Document header
        md.append("# Training Roadmaps Overview\n\n");
        md.append("**User:** ").append(maskEmail(email)).append("\n");
        md.append("**Generated:** ")
          .append(LocalDateTime.now().format(DATE_FORMATTER))
          .append("\n\n");

        // Overall statistics
        int totalTasks = roadmaps.stream()
                .mapToInt(r -> r.getSummary().getTotalTasks())
                .sum();
        int completedTasks = roadmaps.stream()
                .mapToInt(r -> r.getSummary().getCompletedTasks())
                .sum();
        int overallPercent = totalTasks > 0
                ? (int) Math.round(100.0 * completedTasks / totalTasks)
                : 0;

        md.append("## Overall Progress\n\n");
        md.append("| Metric | Value |\n");
        md.append("|--------|-------|\n");
        md.append("| Total Roadmaps | ").append(roadmaps.size()).append(" |\n");
        md.append("| Total Tasks | ").append(totalTasks).append(" |\n");
        md.append("| Completed Tasks | ").append(completedTasks).append(" |\n");
        md.append("| Overall Progress | ").append(overallPercent).append("% |\n");
        md.append("\n---\n\n");

        // Individual roadmaps
        for (MindsetRoadmapDetail detail : roadmaps) {
            md.append(exportRoadmapSection(detail));
            md.append("\n---\n\n");
        }

        return md.toString();
    }

    /**
     * Formats a single task as a Markdown checkbox item.
     */
    private String formatTask(MindsetTaskDto task) {
        StringBuilder sb = new StringBuilder();

        // Checkbox
        sb.append("- [").append(task.isCompleted() ? "x" : " ").append("] ");

        // Task key (formatted)
        sb.append(formatTaskKey(task.getTaskKey()));

        // Optional metadata
        StringBuilder meta = new StringBuilder();
        if (task.getScore() != null && task.getScore() > 0) {
            meta.append("Score: ").append(task.getScore());
        }
        if (task.getUpdatedAt() != null && !task.getUpdatedAt().isEmpty()) {
            if (meta.length() > 0) meta.append(", ");
            meta.append("Updated: ").append(formatDate(task.getUpdatedAt()));
        }

        if (meta.length() > 0) {
            sb.append(" _(").append(meta).append(")_");
        }

        return sb.toString();
    }

    /**
     * Formats a roadmap as a section within a larger document.
     */
    private String exportRoadmapSection(MindsetRoadmapDetail detail) {
        StringBuilder md = new StringBuilder();
        MindsetRoadmapSummary summary = detail.getSummary();

        // Section header (h3 within combined document)
        md.append("### ").append(summary.getTitle()).append("\n\n");

        // Progress bar visualization
        md.append(createProgressBar(summary.getProgressPercent())).append("\n\n");

        // Tasks
        if (detail.getTasks() != null && !detail.getTasks().isEmpty()) {
            for (MindsetTaskDto task : detail.getTasks()) {
                md.append(formatTask(task)).append("\n");
            }
        } else {
            md.append("_No tasks available._\n");
        }

        return md.toString();
    }

    /**
     * Creates a text-based progress bar.
     */
    private String createProgressBar(int percent) {
        int filled = percent / 10;
        int empty = 10 - filled;

        StringBuilder bar = new StringBuilder();
        bar.append("Progress: `[");
        bar.append("█".repeat(Math.max(0, filled)));
        bar.append("░".repeat(Math.max(0, empty)));
        bar.append("]` ").append(percent).append("%");

        return bar.toString();
    }

    /**
     * Formats a task key to be more human-readable.
     * Example: "conflict_1" -> "Conflict 1"
     */
    private String formatTaskKey(String taskKey) {
        if (taskKey == null || taskKey.isBlank()) {
            return "Unknown Task";
        }

        String[] parts = taskKey.replace('_', ' ').replace('-', ' ').split("\\s+");
        StringBuilder result = new StringBuilder();

        for (String part : parts) {
            if (!part.isBlank()) {
                if (result.length() > 0) result.append(" ");
                // Capitalize first letter if it's a letter, otherwise keep as-is (for numbers)
                if (Character.isLetter(part.charAt(0))) {
                    result.append(Character.toUpperCase(part.charAt(0)));
                    if (part.length() > 1) {
                        result.append(part.substring(1).toLowerCase());
                    }
                } else {
                    result.append(part);
                }
            }
        }

        return result.toString();
    }

    /**
     * Formats an ISO date string to a shorter format.
     */
    private String formatDate(String isoDate) {
        if (isoDate == null || isoDate.isEmpty()) {
            return "";
        }
        try {
            // Handle ISO datetime format
            if (isoDate.contains("T")) {
                LocalDateTime dt = LocalDateTime.parse(isoDate.split("\\.")[0]);
                return dt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            }
            return isoDate;
        } catch (Exception e) {
            return isoDate;
        }
    }

    /**
     * Masks email for privacy in exports.
     */
    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return "***";
        }
        String[] parts = email.split("@");
        String local = parts[0];
        String domain = parts[1];

        if (local.length() <= 2) {
            return local.charAt(0) + "***@" + domain;
        }
        return local.substring(0, 2) + "***@" + domain;
    }
}
