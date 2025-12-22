package ee.kerrete.ainterview.evidence.model;

/**
 * Status buckets for evidence freshness.
 * Based on days since last anchored.
 */
public enum EvidenceStatus {
    /**
     * Fresh evidence: 0-14 days since last anchor.
     */
    FRESH(0, 14),

    /**
     * Stale evidence: 15-60 days since last anchor.
     * Needs re-anchoring.
     */
    STALE(15, 60),

    /**
     * Old evidence: 61-180 days since last anchor.
     * Significantly decayed weight.
     */
    OLD(61, 180),

    /**
     * Archive evidence: 181+ days since last anchor.
     * Maximum decay applied but never zero.
     */
    ARCHIVE(181, Integer.MAX_VALUE);

    private final int minDays;
    private final int maxDays;

    EvidenceStatus(int minDays, int maxDays) {
        this.minDays = minDays;
        this.maxDays = maxDays;
    }

    public int getMinDays() {
        return minDays;
    }

    public int getMaxDays() {
        return maxDays;
    }

    /**
     * Determine status from age in days.
     */
    public static EvidenceStatus fromAgeDays(long ageDays) {
        if (ageDays <= 14) {
            return FRESH;
        } else if (ageDays <= 60) {
            return STALE;
        } else if (ageDays <= 180) {
            return OLD;
        } else {
            return ARCHIVE;
        }
    }

    /**
     * Check if this status indicates the evidence needs re-anchoring.
     */
    public boolean needsReanchor() {
        return this == STALE || this == OLD || this == ARCHIVE;
    }
}
