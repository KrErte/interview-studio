package ee.kerrete.ainterview.studio.dto;

/**
 * A single action in the 30-day plan.
 */
public record PlanAction(
        int day,
        String action,
        String outcome
) {}
