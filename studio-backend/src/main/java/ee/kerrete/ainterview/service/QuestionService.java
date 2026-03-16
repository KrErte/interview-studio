package ee.kerrete.ainterview.service;

import ee.kerrete.ainterview.dto.GenerateQuestionsRequest;
import ee.kerrete.ainterview.model.Question;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final AiService aiService;

    /**
     * DEFAULT küsimused (varuvariandi jaoks)
     */

    public List<Question> generateFromCv(String cvText, int techCount, int softCount) {
        return aiService.generateQuestionsFromCv(cvText, techCount, softCount);
    }
    public List<Question> getDefaultQuestions() {
        List<Question> result = new ArrayList<>();
        result.add(new Question("1", "Kirjelda REST API mõistet.", "TECH", "JUNIOR"));
        result.add(new Question("2", "Kuidas teeksid skaleeritava REST API?", "TECH", "SENIOR"));
        result.add(new Question("3", "Kuidas lahendaksid konflikti tiimis?", "SOFT", "MID"));
        return result;
    }

    /**
     * 🔥 PÄRIS OpenAI põhine genereerimine CV alusel
     */
    public List<Question> generateQuestions(GenerateQuestionsRequest request) {
        String cvText = request.getCvText();

        // Kui CV puudub, tagastame default-komplekti
        if (cvText == null || cvText.trim().isEmpty()) {
            return getDefaultQuestions();
        }

        int tech = request.getTechnicalCount() > 0 ? request.getTechnicalCount() : 6;
        int soft = request.getSoftCount() > 0 ? request.getSoftCount() : 4;

        return aiService.generateQuestionsFromCv(cvText, tech, soft);
    }
}
