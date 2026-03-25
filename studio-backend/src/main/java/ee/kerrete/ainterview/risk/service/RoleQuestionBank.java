package ee.kerrete.ainterview.risk.service;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class RoleQuestionBank {

    private static final List<Map<String, Object>> DEFAULT_QUESTIONS = List.of(
        Map.of("id", "q1", "type", "TEXT", "text", "Can you describe a recent professional challenge you faced and how you approached solving it?", "title", "Problem-Solving", "placeholder", "Describe the challenge, your approach, and the outcome...", "required", true),
        Map.of("id", "q2", "type", "TEXT", "text", "How do you typically stay updated with new skills and industry trends in your field?", "title", "Continuous Learning", "placeholder", "Share your learning strategies and recent skill acquisitions...", "required", true),
        Map.of("id", "q3", "type", "TEXT", "text", "Describe your experience collaborating with cross-functional teams. What communication practices work best for you?", "title", "Team Collaboration", "placeholder", "Discuss team dynamics, communication methods, and collaboration outcomes...", "required", true)
    );

    private static final Map<String, List<Map<String, Object>>> ROLE_QUESTIONS = Map.ofEntries(
        Map.entry("software_engineer", List.of(
            Map.of("id", "q1", "type", "TEXT", "text", "Describe a complex technical problem you solved recently. What was your debugging or design approach?", "title", "Technical Problem-Solving", "placeholder", "Explain the problem, your approach, tools used, and the outcome...", "required", true),
            Map.of("id", "q2", "type", "TEXT", "text", "How do you keep up with new programming languages, frameworks, or architectural patterns?", "title", "Tech Learning", "placeholder", "Share courses, side projects, open-source contributions, or reading habits...", "required", true),
            Map.of("id", "q3", "type", "TEXT", "text", "How do you handle code reviews and technical disagreements within your team?", "title", "Code Collaboration", "placeholder", "Describe your review process, how you give/receive feedback, and resolve conflicts...", "required", true)
        )),
        Map.entry("hr_manager", List.of(
            Map.of("id", "q1", "type", "TEXT", "text", "How do you handle a difficult employee situation, such as underperformance or conflict between team members?", "title", "People Management", "placeholder", "Describe the situation, your approach, and the resolution...", "required", true),
            Map.of("id", "q2", "type", "TEXT", "text", "What strategies do you use to improve employee retention and engagement?", "title", "Retention Strategy", "placeholder", "Share specific programs, metrics, or initiatives you have led...", "required", true),
            Map.of("id", "q3", "type", "TEXT", "text", "How do you stay current with employment law changes and HR technology trends?", "title", "HR Knowledge", "placeholder", "Describe your learning sources, certifications, or professional networks...", "required", true)
        )),
        Map.entry("product_manager", List.of(
            Map.of("id", "q1", "type", "TEXT", "text", "Describe how you prioritize features when you have competing stakeholder requests and limited engineering capacity.", "title", "Prioritization", "placeholder", "Explain your framework, trade-offs, and how you communicated decisions...", "required", true),
            Map.of("id", "q2", "type", "TEXT", "text", "How do you validate a product idea before committing development resources?", "title", "Product Validation", "placeholder", "Share methods like user interviews, prototypes, A/B tests, or data analysis...", "required", true),
            Map.of("id", "q3", "type", "TEXT", "text", "How do you measure product success and communicate metrics to leadership?", "title", "Product Metrics", "placeholder", "Describe KPIs you track, dashboards, and reporting cadence...", "required", true)
        )),
        Map.entry("data_scientist", List.of(
            Map.of("id", "q1", "type", "TEXT", "text", "Describe a data project where your analysis directly influenced a business decision. What was your approach?", "title", "Business Impact", "placeholder", "Explain the problem, data sources, methodology, and the decision it drove...", "required", true),
            Map.of("id", "q2", "type", "TEXT", "text", "How do you handle messy or incomplete data in real-world projects?", "title", "Data Quality", "placeholder", "Share your cleaning, imputation, and validation strategies...", "required", true),
            Map.of("id", "q3", "type", "TEXT", "text", "How do you communicate complex statistical findings to non-technical stakeholders?", "title", "Data Storytelling", "placeholder", "Describe visualization tools, simplification techniques, or presentation approaches...", "required", true)
        )),
        Map.entry("designer", List.of(
            Map.of("id", "q1", "type", "TEXT", "text", "Walk us through your design process for a recent project, from research to final deliverable.", "title", "Design Process", "placeholder", "Describe research, ideation, prototyping, testing, and iteration steps...", "required", true),
            Map.of("id", "q2", "type", "TEXT", "text", "How do you handle feedback that conflicts with your design vision?", "title", "Design Feedback", "placeholder", "Share how you balance user needs, stakeholder input, and design principles...", "required", true),
            Map.of("id", "q3", "type", "TEXT", "text", "How do you stay inspired and keep up with design trends and tools?", "title", "Design Growth", "placeholder", "Mention communities, tools, courses, or design systems you follow...", "required", true)
        )),
        Map.entry("sales", List.of(
            Map.of("id", "q1", "type", "TEXT", "text", "Describe your approach to closing a deal with a hesitant or complex enterprise client.", "title", "Deal Closing", "placeholder", "Explain discovery, objection handling, and closing techniques...", "required", true),
            Map.of("id", "q2", "type", "TEXT", "text", "How do you build and maintain a healthy sales pipeline?", "title", "Pipeline Management", "placeholder", "Share your prospecting, qualification, and follow-up strategies...", "required", true),
            Map.of("id", "q3", "type", "TEXT", "text", "How do you adapt your sales approach when entering a new market or selling a new product?", "title", "Sales Adaptability", "placeholder", "Describe how you learn the market, adjust messaging, and ramp up...", "required", true)
        )),
        Map.entry("marketing", List.of(
            Map.of("id", "q1", "type", "TEXT", "text", "Describe a marketing campaign you led that exceeded its goals. What made it successful?", "title", "Campaign Success", "placeholder", "Share the strategy, channels, creative approach, and measurable results...", "required", true),
            Map.of("id", "q2", "type", "TEXT", "text", "How do you decide which marketing channels to invest in for a new product or audience?", "title", "Channel Strategy", "placeholder", "Explain your evaluation framework, testing approach, and budget allocation...", "required", true),
            Map.of("id", "q3", "type", "TEXT", "text", "How do you measure marketing ROI and communicate results to leadership?", "title", "Marketing Analytics", "placeholder", "Describe tools, attribution models, and reporting practices you use...", "required", true)
        )),
        Map.entry("finance", List.of(
            Map.of("id", "q1", "type", "TEXT", "text", "Describe a financial analysis or forecast that significantly impacted a business decision.", "title", "Financial Analysis", "placeholder", "Explain the context, methodology, key findings, and business outcome...", "required", true),
            Map.of("id", "q2", "type", "TEXT", "text", "How do you ensure accuracy and compliance in financial reporting?", "title", "Financial Accuracy", "placeholder", "Share your review processes, tools, and compliance frameworks...", "required", true),
            Map.of("id", "q3", "type", "TEXT", "text", "How do you stay current with financial regulations and accounting standards?", "title", "Finance Knowledge", "placeholder", "Describe certifications, training, or professional development activities...", "required", true)
        )),
        Map.entry("operations", List.of(
            Map.of("id", "q1", "type", "TEXT", "text", "Describe a process improvement you implemented that measurably increased efficiency.", "title", "Process Improvement", "placeholder", "Explain the bottleneck, your solution, and the quantified impact...", "required", true),
            Map.of("id", "q2", "type", "TEXT", "text", "How do you manage competing priorities and resource constraints in day-to-day operations?", "title", "Resource Management", "placeholder", "Share your prioritization framework and decision-making approach...", "required", true),
            Map.of("id", "q3", "type", "TEXT", "text", "How do you ensure quality and consistency across teams or locations?", "title", "Quality Assurance", "placeholder", "Describe standards, monitoring tools, and feedback loops you use...", "required", true)
        ))
    );

    private static final Map<String, String> ROLE_ALIASES = Map.ofEntries(
        Map.entry("software engineer", "software_engineer"),
        Map.entry("software developer", "software_engineer"),
        Map.entry("web developer", "software_engineer"),
        Map.entry("frontend developer", "software_engineer"),
        Map.entry("backend developer", "software_engineer"),
        Map.entry("full stack developer", "software_engineer"),
        Map.entry("fullstack developer", "software_engineer"),
        Map.entry("devops engineer", "software_engineer"),
        Map.entry("sre", "software_engineer"),
        Map.entry("qa engineer", "software_engineer"),
        Map.entry("hr manager", "hr_manager"),
        Map.entry("human resources", "hr_manager"),
        Map.entry("recruiter", "hr_manager"),
        Map.entry("talent acquisition", "hr_manager"),
        Map.entry("product manager", "product_manager"),
        Map.entry("product owner", "product_manager"),
        Map.entry("program manager", "product_manager"),
        Map.entry("data scientist", "data_scientist"),
        Map.entry("data analyst", "data_scientist"),
        Map.entry("data engineer", "data_scientist"),
        Map.entry("ml engineer", "data_scientist"),
        Map.entry("machine learning engineer", "data_scientist"),
        Map.entry("designer", "designer"),
        Map.entry("ux designer", "designer"),
        Map.entry("ui designer", "designer"),
        Map.entry("product designer", "designer"),
        Map.entry("graphic designer", "designer"),
        Map.entry("sales", "sales"),
        Map.entry("sales manager", "sales"),
        Map.entry("account executive", "sales"),
        Map.entry("business development", "sales"),
        Map.entry("marketing", "marketing"),
        Map.entry("marketing manager", "marketing"),
        Map.entry("growth marketer", "marketing"),
        Map.entry("content marketer", "marketing"),
        Map.entry("finance", "finance"),
        Map.entry("finance manager", "finance"),
        Map.entry("accountant", "finance"),
        Map.entry("financial analyst", "finance"),
        Map.entry("controller", "finance"),
        Map.entry("operations", "operations"),
        Map.entry("operations manager", "operations"),
        Map.entry("project manager", "operations"),
        Map.entry("supply chain manager", "operations")
    );

    public List<Map<String, Object>> getQuestionsForRole(String rawRole) {
        if (rawRole == null || rawRole.isBlank()) {
            return DEFAULT_QUESTIONS;
        }

        String normalized = rawRole.trim().toLowerCase();

        // Direct family match
        if (ROLE_QUESTIONS.containsKey(normalized)) {
            return ROLE_QUESTIONS.get(normalized);
        }

        // Alias match
        String family = ROLE_ALIASES.get(normalized);
        if (family != null) {
            return ROLE_QUESTIONS.getOrDefault(family, DEFAULT_QUESTIONS);
        }

        // Substring match as last resort
        for (Map.Entry<String, String> entry : ROLE_ALIASES.entrySet()) {
            if (normalized.contains(entry.getKey()) || entry.getKey().contains(normalized)) {
                return ROLE_QUESTIONS.getOrDefault(entry.getValue(), DEFAULT_QUESTIONS);
            }
        }

        return DEFAULT_QUESTIONS;
    }
}
