package ee.kerrete.ainterview.pivot.enums;

/**
 * Controls what parts of a candidate profile can be shown in the marketplace.
 */
public enum VisibilityLevel {
    OFF,   // not discoverable
    ANON,  // discoverable, anonymized identity
    PUBLIC; // discoverable with identity

    public boolean allowsAnonymousView() {
        return this == ANON || this == PUBLIC;
    }

    public boolean allowsIdentifiedView() {
        return this == PUBLIC;
    }
}

