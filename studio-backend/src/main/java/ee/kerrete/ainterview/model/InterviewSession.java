package ee.kerrete.ainterview.model;

import ee.kerrete.ainterview.interview.enums.InterviewerStyle;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "interview_session")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company", nullable = false)
    private String company;

    @Column(name = "role", nullable = false)
    private String role;

    @Column(name = "seniority")
    private String seniority;

    @Column(name = "session_uuid", unique = true)
    private UUID sessionUuid;

    @Enumerated(EnumType.STRING)
    @Column(name = "interviewer_style", length = 50)
    private InterviewerStyle interviewerStyle;

    @Column(name = "last1_answer", columnDefinition = "CLOB")
    private String last1Answer;

    @Column(name = "last3_answers", columnDefinition = "CLOB")
    private String last3Answers;

    @Column(name = "last5_answers", columnDefinition = "CLOB")
    private String last5Answers;

    @Column(name = "question_count")
    private Integer questionCount;

    @Column(name = "current_dimension")
    private String currentDimension;

    @Column(name = "asked_question_ids", columnDefinition = "CLOB")
    private String askedQuestionIds;

    @Column(name = "probe_count")
    private Integer probeCount;

    @Column(name = "overall_fit_prev")
    private Double overallFitPrev;

    @Column(name = "current_question_id")
    private String currentQuestionId;

    @Lob
    @Column(name = "current_question_text", columnDefinition = "CLOB")
    private String currentQuestionText;

    /**
     * Serialized list of Q&A pairs (JSON stored as text for simplicity).
     */
    @Lob
    @Column(name = "question_answers", columnDefinition = "CLOB")
    private String questionAnswers;

    @Column(name = "candidate_summary_json", columnDefinition = "jsonb")
    private String candidateSummaryJson;

    @Column(name = "candidate_summary_updated_at")
    private LocalDateTime candidateSummaryUpdatedAt;

    @Column(name = "interview_profile_json", columnDefinition = "jsonb")
    private String interviewProfileJson;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (candidateSummaryJson == null) {
            candidateSummaryJson = "{}";
        }
        if (candidateSummaryUpdatedAt == null) {
            candidateSummaryUpdatedAt = LocalDateTime.now();
        }
        if (interviewProfileJson == null) {
            interviewProfileJson = "{}";
        }
    }
}

