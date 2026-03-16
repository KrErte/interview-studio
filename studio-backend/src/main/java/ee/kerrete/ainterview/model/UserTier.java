package ee.kerrete.ainterview.model;

public enum UserTier {
    FREE,
    ARENA_PRO;

    public boolean isAtLeast(UserTier required) {
        return this.ordinal() >= required.ordinal();
    }
}
