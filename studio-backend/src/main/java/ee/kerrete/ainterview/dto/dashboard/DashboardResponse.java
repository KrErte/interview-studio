package ee.kerrete.ainterview.dto.dashboard;

import ee.kerrete.ainterview.career.dto.FutureProofScoreDto;
import ee.kerrete.ainterview.career.dto.RoleMatchDto;
import ee.kerrete.ainterview.career.dto.SkillProfileDto;
import ee.kerrete.ainterview.dto.CvSummaryDto;
import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class DashboardResponse {
    String email;
    CvSummaryDto cvSummary;
    SkillProfileDto skillProfile;
    List<RoleMatchDto> recentRoleMatches;
    List<FutureProofScoreDto> futureProofScores;
    DashboardTrainingDto training;
    List<DashboardJobAnalysisDto> jobAnalyses;
}

