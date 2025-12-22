package ee.kerrete.ainterview.evidence.service;

import ee.kerrete.ainterview.evidence.model.EvidenceStatus;
import org.springframework.stereotype.Component;

/**
 * Calculator for evidence decay weight based on age.
 * Uses exponential decay with configurable half-life.
 * Weight is clamped to [0.2, 1.0] - never fully zero in v1.
 */
@Component
public class EvidenceDecayCalculator {

    /**
     * Default half-life in days.
     * After this many days, evidence weight is halved.
     */
    private static final double DEFAULT_HALF_LIFE_DAYS = 90.0;

    /**
     * Minimum weight - evidence never fully decays to zero.
     */
    private static final double MIN_WEIGHT = 0.2;

    /**
     * Maximum weight for fresh evidence.
     */
    private static final double MAX_WEIGHT = 1.0;

    /**
     * Calculate decay weight for evidence based on age in days.
     *
     * Formula: weight = exp(-ln(2) * age_days / half_life_days)
     * Clamped to [MIN_WEIGHT, MAX_WEIGHT]
     *
     * @param ageDays number of days since last anchor
     * @return weight between MIN_WEIGHT and MAX_WEIGHT
     */
    public double calculateWeight(long ageDays) {
        return calculateWeight(ageDays, DEFAULT_HALF_LIFE_DAYS);
    }

    /**
     * Calculate decay weight with custom half-life.
     *
     * @param ageDays number of days since last anchor
     * @param halfLifeDays half-life period in days
     * @return weight between MIN_WEIGHT and MAX_WEIGHT
     */
    public double calculateWeight(long ageDays, double halfLifeDays) {
        if (ageDays <= 0) {
            return MAX_WEIGHT;
        }

        if (halfLifeDays <= 0) {
            halfLifeDays = DEFAULT_HALF_LIFE_DAYS;
        }

        // Exponential decay: w = exp(-ln(2) * t / T_half)
        double rawWeight = Math.exp(-Math.log(2) * ageDays / halfLifeDays);

        // Clamp to [MIN_WEIGHT, MAX_WEIGHT]
        return Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, rawWeight));
    }

    /**
     * Determine status from age in days.
     *
     * @param ageDays number of days since last anchor
     * @return the evidence status bucket
     */
    public EvidenceStatus determineStatus(long ageDays) {
        return EvidenceStatus.fromAgeDays(ageDays);
    }

    /**
     * Check if evidence needs re-anchoring based on age.
     *
     * @param ageDays number of days since last anchor
     * @return true if status >= STALE
     */
    public boolean needsReanchor(long ageDays) {
        return determineStatus(ageDays).needsReanchor();
    }

    /**
     * Get the configured half-life in days.
     */
    public double getHalfLifeDays() {
        return DEFAULT_HALF_LIFE_DAYS;
    }

    /**
     * Get the minimum weight floor.
     */
    public double getMinWeight() {
        return MIN_WEIGHT;
    }

    /**
     * Get the maximum weight ceiling.
     */
    public double getMaxWeight() {
        return MAX_WEIGHT;
    }
}
