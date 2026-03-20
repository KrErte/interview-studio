package ee.kerrete.ainterview.service;

import ee.kerrete.ainterview.dto.PracticeQuestionDto;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Deterministlik küsimuste pank.
 * Iga bloker → 5 harjutusküsimust konkreetse nõrkuse peale.
 */
@Component
public class PracticeQuestionBank {

    private final Map<String, List<PracticeQuestionDto>> bank = new LinkedHashMap<>();

    public PracticeQuestionBank() {
        bank.put("gap_over_18_months", List.of(
            new PracticeQuestionDto("gap-1",
                "Sul on üle 18-kuine lünk CV-s. Kuidas selgitaksid seda intervjuul loomulikult?",
                "gap_over_18_months",
                "Kasuta STAR-meetodit: mis toimus, mida õppisid, kuidas see sind tugevdas."),
            new PracticeQuestionDto("gap-2",
                "Küsitav küsib otse: 'Miks te nii kaua tööta olite?' Mida vastate?",
                "gap_over_18_months",
                "Ole aus ja lühike — lünka ei pea vabandama, tuleb raamistada kui teadlik periood."),
            new PracticeQuestionDto("gap-3",
                "Kuidas näitad, et oled lünka perioodi jooksul valdkonnas kursis püsinud?",
                "gap_over_18_months",
                "Too konkreetseid näiteid: kursused, projektid, lugemine, ühendused."),
            new PracticeQuestionDto("gap-4",
                "Intervjueerija on skeptiline — 'Kas olete veel aktuaalne?' Kuidas vastate?",
                "gap_over_18_months",
                "Rõhuta konkreetseid viimaseid tegevusi ja tulemusi, mitte aastaid."),
            new PracticeQuestionDto("gap-5",
                "Kuidas positsioneerid lünka perioodist saadud oskused praeguse rolli jaoks oluliseks?",
                "gap_over_18_months",
                "Seo lünka ajal saadud kogemus otseselt ametikoha vajadustega.")
        ));

        bank.put("career_switch", List.of(
            new PracticeQuestionDto("cs-1",
                "Sa vahetad valdkonda. Miks peaksid tööandja sind valima kellegi ees, kellel on otsene kogemus?",
                "career_switch",
                "Rõhuta transferable skills'e ja motivatsiooni — 'miks sina' on tugevam kui 'miks mitte'."),
            new PracticeQuestionDto("cs-2",
                "Nimeta 3 oskust oma eelmisest valdkonnast, mis on uues rollis väärtuslikud. Too konkreetsed näited.",
                "career_switch",
                "Iga oskuse juures too üks konkreetne lugu: olukord → tegevus → tulemus."),
            new PracticeQuestionDto("cs-3",
                "Kuidas selgitaksid oma karjäärivahetuse otsust nii, et see kõlab strateegiliselt, mitte meeleheite tulemusena?",
                "career_switch",
                "Räägi sellest kui loogilisest järgmisest sammust, mitte põgenemisest."),
            new PracticeQuestionDto("cs-4",
                "Milliseid konkreetseid samme oled teinud, et uueks valdkonnaks valmistuda?",
                "career_switch",
                "Näita tegevusi: kursused, isiklikud projektid, mentorid, ühendused."),
            new PracticeQuestionDto("cs-5",
                "Tööandja muretseb riskist. Kuidas veenaksid, et see on kontrollitud ja hoolimisega tehtud otsus?",
                "career_switch",
                "Too tõendeid: uurimistöö, katseprojektid, kontaktid uues valdkonnas.")
        ));

        bank.put("urgency_weak", List.of(
            new PracticeQuestionDto("uw-1",
                "Kui kiiresti pead töö leidma ja kuidas see mõjutab sinu lähenemist intervjuule?",
                "urgency_weak",
                "Ole aus ajaraami suhtes, aga rõhuta, et kiirus ei tähenda kompromissi sobivuses."),
            new PracticeQuestionDto("uw-2",
                "Kuidas hoiad fookust ja enesekindlust, kui tööotsing venib pikemaks kui lootsid?",
                "urgency_weak",
                "Räägi konkreetsetest strateegiatest: rutiin, eesmärgid, toetussüsteem."),
            new PracticeQuestionDto("uw-3",
                "Intervjueerija küsib: 'Mis on teie pikaajaline plaan selles rollis?' Kuidas vastate?",
                "urgency_weak",
                "Ära räägi ainult lühiajalistest vajadustest — näita pikaajalist huvi ja kasvu."),
            new PracticeQuestionDto("uw-4",
                "Kuidas valmistad ette vastuse küsimusele: 'Miks te just meie ettevõttesse kandideerite?'",
                "urgency_weak",
                "Uurimistöö on võtmetähtis — personaliseeri vastus ettevõtte konkreetsete aspektidega."),
            new PracticeQuestionDto("uw-5",
                "Kuidas positsioneerid end kandidaadina, kellel on selge väärtuspakkumine, mitte lihtsalt töötaja?",
                "urgency_weak",
                "Mõtle läbi: mis probleemi sa lahendad ettevõtte jaoks, mitte vastupidi.")
        ));

        bank.put("experience_outdated", List.of(
            new PracticeQuestionDto("eo-1",
                "Su peamine kogemus on 3+ aastat vana. Kuidas näitad, et oled endiselt asjakohane?",
                "experience_outdated",
                "Too konkreetsed näited kuidas oled end uuendanud: tööriistad, metoodikad, projektid."),
            new PracticeQuestionDto("eo-2",
                "Mis on muutunud sinu valdkonnas viimase 3 aasta jooksul ja kuidas oled kohanenud?",
                "experience_outdated",
                "Demonstreeri valdkonnateadlikkust — loe artikleid, järgi trende, osale kogukondades."),
            new PracticeQuestionDto("eo-3",
                "Kirjelda projekti, kus kasutasid kaasaegseid töövahendeid või meetodeid.",
                "experience_outdated",
                "Kui ei ole tööprojekte, too isiklikud projektid või koolitused."),
            new PracticeQuestionDto("eo-4",
                "Kuidas tagad, et su teadmised on kursis turu vajadustega?",
                "experience_outdated",
                "Ole spetsiifiline: milliseid ressursse kasutad, kui tihti, mida viimati õppisid."),
            new PracticeQuestionDto("eo-5",
                "Intervjueerija mainib uut tööriista/tehnoloogiat. Kuidas reageerid, kui see on sulle uus?",
                "experience_outdated",
                "Aus huvi on parem kui teesklemine — näita õppimisvõimet, mitte ainult teadmisi.")
        ));

        bank.put("cv_positioning", List.of(
            new PracticeQuestionDto("cvp-1",
                "Tutvu oma CV-ga kui võõras. Mis on ebaselge või nõrk selles positsioneeringus?",
                "cv_positioning",
                "Vaata CV-d tööandja pilguga: kas roll on koheselt selge? Kas tulemused on mõõdetavad?"),
            new PracticeQuestionDto("cvp-2",
                "Kuidas kirjeldaksid oma väärtuspakkumist ühe lausega?",
                "cv_positioning",
                "Struktuur: [kes sa oled] + [mida teed] + [kes kellele/milleks]."),
            new PracticeQuestionDto("cvp-3",
                "Kas su CV vastab ametikirjelduse märksõnadele? Kuidas kohandaksid?",
                "cv_positioning",
                "ATS-süsteemid filtreerivad — vaata ametikirjeldust ja seo oma CV terminid sellega."),
            new PracticeQuestionDto("cvp-4",
                "Mis on su kõige tugevam saavutus eelmisest rollist? Kuidas seda mõõdetavalt esitad?",
                "cv_positioning",
                "Kasuta numbrilisi tulemusi: %, €, aeg, maht — abstract väited ei müü."),
            new PracticeQuestionDto("cvp-5",
                "Kuidas eristud sarnase kogemusega kandidaatidest?",
                "cv_positioning",
                "Leia oma spetsiifiline nišš või kombineeri oskused, mida teistel pole.")
        ));
    }

    /**
     * Tagasta küsimused antud blokerite jaoks.
     * Kui bloker on tundmatu, jäetakse vahele.
     * Tagastab max 5 küsimust (vähemalt 1 iga tuntud blokeri kohta).
     */
    public List<PracticeQuestionDto> getQuestionsFor(List<String> blockers) {
        List<PracticeQuestionDto> result = new ArrayList<>();

        if (blockers == null || blockers.isEmpty()) {
            // Tagasta üldised küsimused kõigist kategooriatest
            bank.values().forEach(qs -> result.add(qs.get(0)));
            return result;
        }

        for (String blocker : blockers) {
            List<PracticeQuestionDto> qs = bank.get(blocker);
            if (qs != null) {
                // Võta kuni 3 küsimust iga blokeri kohta
                result.addAll(qs.subList(0, Math.min(3, qs.size())));
            }
        }

        // Shuffle nii et järjekord pole alati sama
        Collections.shuffle(result);

        // Max 5 küsimust sessiooni kohta (free tier)
        return result.size() > 5 ? result.subList(0, 5) : result;
    }

    public List<String> availableBlockers() {
        return new ArrayList<>(bank.keySet());
    }
}
