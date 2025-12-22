package ee.kerrete.ainterview.evidence.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import ee.kerrete.ainterview.evidence.dto.CreateEvidenceRequest;
import ee.kerrete.ainterview.evidence.dto.EvidenceAuditPreviewDto;
import ee.kerrete.ainterview.evidence.dto.EvidenceEntryDto;
import ee.kerrete.ainterview.evidence.dto.EvidenceListResponse;
import ee.kerrete.ainterview.evidence.model.EvidenceStatus;
import ee.kerrete.ainterview.evidence.service.EvidenceService;
import ee.kerrete.ainterview.security.AuthenticatedUser;
import ee.kerrete.ainterview.model.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Controller tests for EvidenceController.
 */
@WebMvcTest(EvidenceController.class)
class EvidenceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private EvidenceService evidenceService;

    private static final String TEST_EMAIL = "test@example.com";
    private static final UUID TEST_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        // Setup mock authentication
        AuthenticatedUser mockUser = new AuthenticatedUser(1L, TEST_EMAIL, UserRole.USER);
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(mockUser);
        when(authentication.isAuthenticated()).thenReturn(true);

        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    @DisplayName("POST /api/evidence creates new evidence entry")
    void createEvidence_ReturnsCreatedEntry() throws Exception {
        CreateEvidenceRequest request = new CreateEvidenceRequest("This is my evidence content for testing");

        EvidenceEntryDto mockResponse = EvidenceEntryDto.builder()
                .id(TEST_ID)
                .content(request.content())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .lastAnchoredAt(LocalDateTime.now())
                .anchorCount(0)
                .ageDays(0)
                .weight(1.0)
                .status(EvidenceStatus.FRESH)
                .needsReanchor(false)
                .extractedVerbs(Collections.emptyList())
                .extractedEntities(Collections.emptyList())
                .build();

        when(evidenceService.createEvidence(eq(TEST_EMAIL), any(CreateEvidenceRequest.class)))
                .thenReturn(mockResponse);

        mockMvc.perform(post("/api/evidence")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(TEST_ID.toString()))
                .andExpect(jsonPath("$.content").value(request.content()))
                .andExpect(jsonPath("$.status").value("FRESH"))
                .andExpect(jsonPath("$.weight").value(1.0))
                .andExpect(jsonPath("$.needsReanchor").value(false));
    }

    @Test
    @DisplayName("POST /api/evidence validates content length")
    void createEvidence_ValidatesContent() throws Exception {
        CreateEvidenceRequest request = new CreateEvidenceRequest("ab");

        mockMvc.perform(post("/api/evidence")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/evidence returns list with computed fields")
    void getEvidenceList_ReturnsEntriesWithComputedFields() throws Exception {
        EvidenceEntryDto entry1 = EvidenceEntryDto.builder()
                .id(UUID.randomUUID())
                .content("Fresh evidence")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .lastAnchoredAt(LocalDateTime.now())
                .anchorCount(0)
                .ageDays(0)
                .weight(1.0)
                .status(EvidenceStatus.FRESH)
                .needsReanchor(false)
                .extractedVerbs(Collections.emptyList())
                .extractedEntities(Collections.emptyList())
                .build();

        EvidenceEntryDto entry2 = EvidenceEntryDto.builder()
                .id(UUID.randomUUID())
                .content("Stale evidence")
                .createdAt(LocalDateTime.now().minusDays(30))
                .updatedAt(LocalDateTime.now().minusDays(30))
                .lastAnchoredAt(LocalDateTime.now().minusDays(30))
                .anchorCount(0)
                .ageDays(30)
                .weight(0.79)
                .status(EvidenceStatus.STALE)
                .needsReanchor(true)
                .extractedVerbs(Collections.emptyList())
                .extractedEntities(Collections.emptyList())
                .build();

        EvidenceListResponse mockResponse = new EvidenceListResponse(
                List.of(entry1, entry2),
                2,
                1,
                1,
                0,
                0,
                0.9
        );

        when(evidenceService.getEvidenceList(eq(TEST_EMAIL), any()))
                .thenReturn(mockResponse);

        mockMvc.perform(get("/api/evidence"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.totalCount").value(2))
                .andExpect(jsonPath("$.freshCount").value(1))
                .andExpect(jsonPath("$.staleCount").value(1))
                .andExpect(jsonPath("$.entries").isArray())
                .andExpect(jsonPath("$.entries.length()").value(2));
    }

    @Test
    @DisplayName("GET /api/evidence?status=STALE filters by status")
    void getEvidenceList_FiltersbyStatus() throws Exception {
        EvidenceListResponse mockResponse = new EvidenceListResponse(
                Collections.emptyList(),
                0,
                0,
                0,
                0,
                0,
                0.0
        );

        when(evidenceService.getEvidenceList(eq(TEST_EMAIL), eq(EvidenceStatus.STALE)))
                .thenReturn(mockResponse);

        mockMvc.perform(get("/api/evidence").param("status", "STALE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCount").value(0));
    }

    @Test
    @DisplayName("POST /api/evidence/{id}/anchor re-anchors evidence")
    void anchorEvidence_UpdatesLastAnchoredAt() throws Exception {
        EvidenceEntryDto mockResponse = EvidenceEntryDto.builder()
                .id(TEST_ID)
                .content("Anchored evidence")
                .createdAt(LocalDateTime.now().minusDays(30))
                .updatedAt(LocalDateTime.now())
                .lastAnchoredAt(LocalDateTime.now())
                .anchorCount(1)
                .ageDays(0)
                .weight(1.0)
                .status(EvidenceStatus.FRESH)
                .needsReanchor(false)
                .extractedVerbs(Collections.emptyList())
                .extractedEntities(Collections.emptyList())
                .build();

        when(evidenceService.anchorEvidence(eq(TEST_EMAIL), eq(TEST_ID)))
                .thenReturn(mockResponse);

        mockMvc.perform(post("/api/evidence/{id}/anchor", TEST_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.anchorCount").value(1))
                .andExpect(jsonPath("$.status").value("FRESH"))
                .andExpect(jsonPath("$.needsReanchor").value(false));
    }

    @Test
    @DisplayName("GET /api/evidence/audit/preview returns audit metrics")
    void getAuditPreview_ReturnsAuditMetrics() throws Exception {
        EvidenceAuditPreviewDto mockPreview = new EvidenceAuditPreviewDto(
                10,
                new BigDecimal("75.50"),
                new BigDecimal("82.30"),
                new BigDecimal("6.80"),
                "Refreshing your oldest evidence could improve your score by up to 6.8 points."
        );

        when(evidenceService.getAuditPreview(eq(TEST_EMAIL)))
                .thenReturn(mockPreview);

        mockMvc.perform(get("/api/evidence/audit/preview"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.evidenceCount").value(10))
                .andExpect(jsonPath("$.exposureScoreCurrent").value(75.50))
                .andExpect(jsonPath("$.exposureScoreWithoutOldest3").value(82.30))
                .andExpect(jsonPath("$.delta").value(6.80))
                .andExpect(jsonPath("$.message").isNotEmpty());
    }
}
