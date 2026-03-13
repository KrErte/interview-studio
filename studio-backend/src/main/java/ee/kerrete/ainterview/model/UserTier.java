package ee.kerrete.ainterview.model;

public enum UserTier {
    FREE,
    ESSENTIALS,
    PROFESSIONAL,
    LIFETIME;

    public boolean isAtLeast(UserTier required) {
        return this.ordinal() >= required.ordinal();
    }
}
