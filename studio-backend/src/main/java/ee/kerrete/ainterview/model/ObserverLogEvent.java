package ee.kerrete.ainterview.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.hibernate.annotations.UuidGenerator;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "observer_log")
public class ObserverLogEvent {

    @Id
    @UuidGenerator
    private UUID id;

    @Column(name = "session_uuid", nullable = false)
    private UUID sessionUuid;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "stage", nullable = false, length = 64)
    private ObserverStage stage;

    @Column(name = "risk_before")
    private Integer riskBefore;

    @Column(name = "risk_after")
    private Integer riskAfter;

    @Column(name = "confidence_before")
    private Integer confidenceBefore;

    @Column(name = "confidence_after")
    private Integer confidenceAfter;

    @Column(name = "signals_json", columnDefinition = "text")
    private String signalsJson;

    @Column(name = "weaknesses_json", columnDefinition = "text")
    private String weaknessesJson;

    @Column(name = "rationale_summary", columnDefinition = "text")
    private String rationaleSummary;

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getSessionUuid() {
        return sessionUuid;
    }

    public void setSessionUuid(UUID sessionUuid) {
        this.sessionUuid = sessionUuid;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public ObserverStage getStage() {
        return stage;
    }

    public void setStage(ObserverStage stage) {
        this.stage = stage;
    }

    public Integer getRiskBefore() {
        return riskBefore;
    }

    public void setRiskBefore(Integer riskBefore) {
        this.riskBefore = riskBefore;
    }

    public Integer getRiskAfter() {
        return riskAfter;
    }

    public void setRiskAfter(Integer riskAfter) {
        this.riskAfter = riskAfter;
    }

    public Integer getConfidenceBefore() {
        return confidenceBefore;
    }

    public void setConfidenceBefore(Integer confidenceBefore) {
        this.confidenceBefore = confidenceBefore;
    }

    public Integer getConfidenceAfter() {
        return confidenceAfter;
    }

    public void setConfidenceAfter(Integer confidenceAfter) {
        this.confidenceAfter = confidenceAfter;
    }

    public String getSignalsJson() {
        return signalsJson;
    }

    public void setSignalsJson(String signalsJson) {
        this.signalsJson = signalsJson;
    }

    public String getWeaknessesJson() {
        return weaknessesJson;
    }

    public void setWeaknessesJson(String weaknessesJson) {
        this.weaknessesJson = weaknessesJson;
    }

    public String getRationaleSummary() {
        return rationaleSummary;
    }

    public void setRationaleSummary(String rationaleSummary) {
        this.rationaleSummary = rationaleSummary;
    }
}

