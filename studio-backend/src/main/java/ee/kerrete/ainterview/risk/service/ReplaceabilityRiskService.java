package ee.kerrete.ainterview.risk.service;

import ee.kerrete.ainterview.risk.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class ReplaceabilityRiskService {

    private final Map<String, AnalyzeResponse> store = new ConcurrentHashMap<>();

    public AnalyzeResponse analyze(AnalyzeRequest r) {
        AnalyzeResponse res = new AnalyzeResponse();
        res.setAnalysisId(UUID.randomUUID().toString());
        res.setPhase("PRELIMINARY");
        res.setReplaceabilityPct(62);
        res.setRiskLabel("HIGH");
        res.setConfidence("MEDIUM");
        res.setStrengths(List.of("Hea tehniline taust", "Kogemus süsteemidega"));
        res.setRisks(List.of("Rutiinsed ülesanded", "Vähene AI-võimendus"));
        res.setWhySummary("Sinu roll sisaldab automatiseeritavaid mustreid, kuid kogemus aitab riski vähendada.");

        AnalyzeResponse.ClarifyingQuestion q1 = new AnalyzeResponse.ClarifyingQuestion();
        q1.setId("q1"); q1.setQuestion("Millist osa tööst oleks kõige raskem automatiseerida?"); q1.setHint("Mõtle otsustele, mitte koodile.");
        AnalyzeResponse.ClarifyingQuestion q2 = new AnalyzeResponse.ClarifyingQuestion();
        q2.setId("q2"); q2.setQuestion("Kui palju kasutad AI-tööriistu igapäevaselt?"); q2.setHint("Näited: Copilot, ChatGPT.");
        AnalyzeResponse.ClarifyingQuestion q3 = new AnalyzeResponse.ClarifyingQuestion();
        q3.setId("q3"); q3.setQuestion("Kas vastutad lahenduste disaini eest?"); q3.setHint("Arhitektuur, otsused.");

        res.setClarifyingQuestions(List.of(q1,q2,q3));
        store.put(res.getAnalysisId(), res);
        return res;
    }

    public RefineResponse refine(RefineRequest r) {
        AnalyzeResponse base = store.get(r.getAnalysisId());
        if (base == null) throw new RuntimeException("analysisId not found");

        RefineResponse out = new RefineResponse();
        out.setAnalysisId(r.getAnalysisId());
        out.setPhase("FINAL");
        out.setReplaceabilityPct(48);
        out.setDeltaPct(-14);
        out.setRiskLabel("MEDIUM");
        out.setConfidence("HIGH");
        out.setStrengths(base.getStrengths());
        out.setRisks(base.getRisks());
        out.setWhatChanged(List.of("Tuvastati kõrge otsustusautonoomia", "AI-tööriistade aktiivne kasutus"));

        RefineResponse.Roadmap rm = new RefineResponse.Roadmap();
        rm.setDays(10);
        rm.setItems(List.of(
            item(1,"Audit","Kaardista rutiinsed tööd","Nimekiri","Vähendab rutiini riski"),
            item(2,"AI võimendus","Lisa AI oma workflow’sse","Näited","AI leverage ↑")
        ));
        out.setRoadmap(rm);
        return out;
    }

    private RefineResponse.Item item(int d,String t,String a,String o,String i){
        RefineResponse.Item it=new RefineResponse.Item();
        it.setDay(d); it.setTitle(t); it.setActions(List.of(a)); it.setOutput(o); it.setImpact(i);
        return it;
    }
}
