package ee.kerrete.ainterview.arena.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.arena.dto.MockInterviewRespondResponse;
import ee.kerrete.ainterview.arena.dto.MockInterviewRespondResponse.BlockerResolution;
import ee.kerrete.ainterview.arena.dto.MockInterviewRespondResponse.MockInterviewSummary;
import ee.kerrete.ainterview.arena.dto.MockInterviewStartResponse;
import ee.kerrete.ainterview.arena.model.ArenaSession;
import ee.kerrete.ainterview.arena.repository.ArenaSessionRepository;
import ee.kerrete.ainterview.model.CareerSession;
import ee.kerrete.ainterview.repository.CareerSessionRepository;
import ee.kerrete.ainterview.service.AiService;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MockInterviewService {

    private final AiService aiService;
    private final ArenaSessionRepository arenaSessionRepository;
    private final CareerSessionRepository careerSessionRepository;
    private final ObjectMapper objectMapper;

    private static final int TOTAL_QUESTIONS = 5;

    // ─── Start ───────────────────────────────────────────────────────────────

    public MockInterviewStartResponse start(Long careerSessionId, Long userId) {
        CareerSession career = careerSessionRepository.findById(careerSessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));

        List<String> blockers = parseBlockers(career.getBlockersJson());
        String role   = career.getTargetRole();
        String status = career.getStatus();

        // Q1 is always a warm-up role question
        String firstBlocker = blockers.isEmpty() ? null : blockers.get(0);
        String firstQuestion = generateWarmupQuestion(role, status);

        MockState state = new MockState();
        state.careerSessionId = careerSessionId;
        state.role             = role;
        state.status           = status;
        state.blockers         = blockers;
        state.currentQuestion  = 1;
        state.questions        = new ArrayList<>(List.of(firstQuestion));
        state.answers          = new ArrayList<>();
        state.targetedBlockers = new ArrayList<>(List.of("warmup"));

        ArenaSession arena = ArenaSession.builder()
                .userId(userId)
                .toolType("mock-interview")
                .sessionData(toJson(state))
                .build();
        arena = arenaSessionRepository.save(arena);

        return new MockInterviewStartResponse(
                arena.getId(),
                firstQuestion,
                1,
                TOTAL_QUESTIONS,
                null,   // warmup has no targeted blocker
                role,
                status
        );
    }

    // ─── Respond ─────────────────────────────────────────────────────────────

    public MockInterviewRespondResponse respond(Long arenaSessionId, String answer, Long userId) {
        ArenaSession arena = arenaSessionRepository.findById(arenaSessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Arena session not found"));

        MockState state = fromJson(arena.getSessionData(), MockState.class);
        state.answers.add(answer);

        // If this was the last answer → produce summary
        if (state.currentQuestion >= TOTAL_QUESTIONS) {
            return buildSummary(arena, state);
        }

        // Determine which blocker to target next (questions 2-4 = blocker 0-2, question 5 = synthesis)
        int nextQ     = state.currentQuestion + 1;   // 1-based
        String nextQuestion;
        String nextTargetedBlocker;

        if (nextQ <= state.blockers.size() + 1 && !state.blockers.isEmpty()) {
            // Questions 2, 3, 4 target blockers[0], [1], [2]
            int blockerIdx = nextQ - 2;              // 0-based index
            if (blockerIdx < state.blockers.size()) {
                nextTargetedBlocker = state.blockers.get(blockerIdx);
                nextQuestion = generateBlockerQuestion(state.role, nextTargetedBlocker, state.status);
            } else {
                nextTargetedBlocker = "synthesis";
                nextQuestion = generateSynthesisQuestion(state.role, state.status);
            }
        } else {
            nextTargetedBlocker = "synthesis";
            nextQuestion = generateSynthesisQuestion(state.role, state.status);
        }

        // Evaluate the answer that was just given against its targeted blocker
        String prevTargeted = state.targetedBlockers.get(state.currentQuestion - 1);
        String feedback       = evaluateAnswer(answer, state.role, prevTargeted, state.status);
        String blockerFeedback = evaluateBlockerResolution(answer, prevTargeted, state.role);

        state.currentQuestion++;
        state.questions.add(nextQuestion);
        state.targetedBlockers.add(nextTargetedBlocker);
        arena.setSessionData(toJson(state));
        arenaSessionRepository.save(arena);

        return new MockInterviewRespondResponse(
                arena.getId(),
                false,
                nextQuestion,
                state.currentQuestion,
                TOTAL_QUESTIONS,
                "synthesis".equals(nextTargetedBlocker) ? null : nextTargetedBlocker,
                feedback,
                blockerFeedback,
                null
        );
    }

    // ─── Summary (called when last answer submitted) ──────────────────────────

    private MockInterviewRespondResponse buildSummary(ArenaSession arena, MockState state) {
        String history = buildHistory(state);
        int answered   = state.answers.size();

        String systemPrompt = """
                You are an expert interview coach. A candidate just completed a mock interview for a %s position.
                Their readiness assessment was: %s (RED=high risk/major gaps, YELLOW=some gaps, GREEN=strong alignment).
                Their identified blockers were:
                %s

                Evaluate their performance based on the actual answers given.
                For each blocker, assess if it was ADDRESSED, PARTIAL, or MISSED in their answers.
                Return ONLY valid JSON (no markdown, no explanation outside JSON):
                {
                  "overallScore": 0-100,
                  "strengths": ["specific strength from their answers"],
                  "weaknesses": ["specific weakness from their answers"],
                  "verdict": "STRONG_HIRE|HIRE|LEAN_HIRE|LEAN_NO_HIRE|NO_HIRE",
                  "improvementPlan": "2-3 sentences of concrete advice",
                  "blockerResolutions": [
                    {"blocker": "blocker text", "resolution": "ADDRESSED|PARTIAL|MISSED", "note": "1 sentence why"}
                  ]
                }
                """.formatted(
                state.role,
                state.status,
                String.join("\n", state.blockers.stream().map(b -> "- " + b).toList())
        );

        String aiResponse = aiService.createChatCompletion(systemPrompt,
                history + "\n\nProvide your final evaluation.");

        MockInterviewSummary summary;
        try {
            var node = objectMapper.readTree(stripCodeFence(aiResponse.trim()));
            int score = node.path("overallScore").asInt(50);
            String verdict = node.path("verdict").asText("LEAN_HIRE");
            String plan = node.path("improvementPlan").asText("");
            List<String> strengths = readStringList(node.path("strengths"));
            List<String> weaknesses = readStringList(node.path("weaknesses"));
            List<BlockerResolution> resolutions = new ArrayList<>();
            var resArr = node.path("blockerResolutions");
            if (resArr.isArray()) {
                for (var r : resArr) {
                    resolutions.add(new BlockerResolution(
                            r.path("blocker").asText(""),
                            r.path("resolution").asText("MISSED"),
                            r.path("note").asText("")
                    ));
                }
            }
            // Fill in any missing blockers
            for (String b : state.blockers) {
                boolean found = resolutions.stream().anyMatch(r -> r.blocker().contains(b.substring(0, Math.min(20, b.length()))));
                if (!found) {
                    resolutions.add(new BlockerResolution(b, "MISSED", "Not addressed in answers."));
                }
            }
            summary = new MockInterviewSummary(score, resolutions, strengths, weaknesses, verdict, plan);
        } catch (Exception e) {
            log.warn("Failed to parse mock interview summary AI response", e);
            summary = fallbackSummary(state, answered);
        }

        arena.setFeedback(toJson(summary));
        arenaSessionRepository.save(arena);

        return new MockInterviewRespondResponse(
                arena.getId(), true, null,
                TOTAL_QUESTIONS, TOTAL_QUESTIONS, null,
                null, null, summary
        );
    }

    // ─── AI prompt helpers ────────────────────────────────────────────────────

    private String generateWarmupQuestion(String role, String status) {
        String prompt = """
                Generate a warm-up opening interview question for a %s position.
                The candidate's readiness level is %s.
                Make it inviting and open-ended (not scary). Ask them to introduce their relevant background.
                Return ONLY valid JSON: {"question": "..."}
                """.formatted(role, status);
        try {
            String raw = aiService.createChatCompletion(prompt, "Generate the warmup question.");
            return objectMapper.readTree(stripCodeFence(raw.trim())).path("question").asText();
        } catch (Exception e) {
            return "Tell me about your background and what draws you to the " + role + " role.";
        }
    }

    private String generateBlockerQuestion(String role, String blocker, String status) {
        String prompt = """
                Generate ONE interview question specifically designed to probe this candidate weakness:
                "%s"

                Context: The candidate is interviewing for %s (readiness: %s).
                The question must directly challenge this weakness — give them a chance to address it.
                Be direct but professional. Use STAR-style framing if appropriate.
                Return ONLY valid JSON: {"question": "..."}
                """.formatted(blocker, role, status);
        try {
            String raw = aiService.createChatCompletion(prompt, "Generate the blocker-targeted question.");
            return objectMapper.readTree(stripCodeFence(raw.trim())).path("question").asText();
        } catch (Exception e) {
            return "Can you walk me through a specific example related to: " + blocker;
        }
    }

    private String generateSynthesisQuestion(String role, String status) {
        String prompt = """
                Generate a final synthesis interview question for a %s position (readiness: %s).
                Ask the candidate to articulate why they are the right fit despite any gaps,
                or how they plan to bridge the gap between their current state and the role requirements.
                Return ONLY valid JSON: {"question": "..."}
                """.formatted(role, status);
        try {
            String raw = aiService.createChatCompletion(prompt, "Generate the synthesis question.");
            return objectMapper.readTree(stripCodeFence(raw.trim())).path("question").asText();
        } catch (Exception e) {
            return "What makes you the right candidate for " + role + " given your current experience level?";
        }
    }

    private String evaluateAnswer(String answer, String role, String targeted, String status) {
        if (answer == null || answer.isBlank()) return "No answer provided.";
        String prompt = """
                A candidate for %s (readiness: %s) answered an interview question.
                Answer: "%s"
                Give 1-2 sentences of constructive feedback on the quality and specificity of their answer.
                Return ONLY valid JSON: {"feedback": "..."}
                """.formatted(role, status, answer.substring(0, Math.min(800, answer.length())));
        try {
            String raw = aiService.createChatCompletion(prompt, "Evaluate this answer.");
            return objectMapper.readTree(stripCodeFence(raw.trim())).path("feedback").asText("Good effort.");
        } catch (Exception e) {
            return "Answer received. Keep being specific with concrete examples.";
        }
    }

    private String evaluateBlockerResolution(String answer, String blocker, String role) {
        if (blocker == null || "warmup".equals(blocker) || "synthesis".equals(blocker)) return null;
        if (answer == null || answer.isBlank()) return "This blocker was not addressed.";
        String prompt = """
                Blocker to address: "%s"
                Candidate's answer: "%s"
                Did the answer specifically address this blocker? Reply with ONE sentence starting with
                "Addressed:" / "Partially addressed:" / "Missed:" then explain why.
                Return ONLY valid JSON: {"blockerFeedback": "..."}
                """.formatted(blocker, answer.substring(0, Math.min(600, answer.length())));
        try {
            String raw = aiService.createChatCompletion(prompt, "Evaluate blocker resolution.");
            return objectMapper.readTree(stripCodeFence(raw.trim())).path("blockerFeedback").asText(null);
        } catch (Exception e) {
            return null;
        }
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private String buildHistory(MockState state) {
        var sb = new StringBuilder();
        sb.append("Mock Interview for: ").append(state.role).append(" (").append(state.status).append(")\n\n");
        for (int i = 0; i < state.questions.size(); i++) {
            sb.append("Q").append(i + 1).append(": ").append(state.questions.get(i)).append("\n");
            if (i < state.answers.size()) {
                sb.append("A").append(i + 1).append(": ").append(state.answers.get(i)).append("\n\n");
            }
        }
        return sb.toString();
    }

    private MockInterviewSummary fallbackSummary(MockState state, int answered) {
        List<BlockerResolution> resolutions = state.blockers.stream()
                .map(b -> new BlockerResolution(b, "MISSED", "Could not evaluate — please retry."))
                .toList();
        return new MockInterviewSummary(
                Math.max(20, answered * 15),
                resolutions,
                List.of("Completed " + answered + " questions"),
                List.of("AI evaluation unavailable — try again"),
                answered >= 4 ? "LEAN_HIRE" : "LEAN_NO_HIRE",
                "Complete all 5 questions and try again for a full evaluation."
        );
    }

    @SuppressWarnings("unchecked")
    private List<String> parseBlockers(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    private List<String> readStringList(com.fasterxml.jackson.databind.JsonNode node) {
        List<String> result = new ArrayList<>();
        if (node != null && node.isArray()) {
            node.forEach(n -> result.add(n.asText()));
        }
        return result;
    }

    private String stripCodeFence(String raw) {
        if (raw.startsWith("```")) {
            int first = raw.indexOf('\n');
            int last  = raw.lastIndexOf("```");
            if (first >= 0 && last > first) return raw.substring(first + 1, last).trim();
        }
        return raw;
    }

    private String toJson(Object obj) {
        try { return objectMapper.writeValueAsString(obj); }
        catch (Exception e) { return "{}"; }
    }

    private <T> T fromJson(String json, Class<T> clazz) {
        try { return objectMapper.readValue(json, clazz); }
        catch (Exception e) { throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Corrupted session data"); }
    }

    // ─── Inner state ─────────────────────────────────────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    static class MockState {
        Long careerSessionId;
        String role;
        String status;
        List<String> blockers        = new ArrayList<>();
        int currentQuestion;
        List<String> questions       = new ArrayList<>();
        List<String> answers         = new ArrayList<>();
        List<String> targetedBlockers = new ArrayList<>();
    }
}
