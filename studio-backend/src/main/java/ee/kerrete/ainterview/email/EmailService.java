package ee.kerrete.ainterview.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${email.from:noreply@tulevikukindlus.ee}")
    private String fromEmail;

    @Value("${email.enabled:false}")
    private boolean emailEnabled;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendAssessmentResults(String toEmail, AssessmentEmailData data) {
        if (!emailEnabled) {
            log.info("Email disabled. Would send assessment results to: {}", toEmail);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Sinu karjääri tulevikukaart - " + data.getRiskPercent() + "% risk");
            helper.setText(buildEmailContent(data), true);

            mailSender.send(message);
            log.info("Assessment results email sent to: {}", toEmail);

        } catch (MessagingException e) {
            log.error("Failed to send email to: {}", toEmail, e);
            throw new RuntimeException("Email sending failed", e);
        }
    }

    private String buildEmailContent(AssessmentEmailData data) {
        String riskColor = data.getRiskPercent() < 35 ? "#10b981" :
                          data.getRiskPercent() < 60 ? "#f59e0b" : "#ef4444";
        String riskLabel = data.getRiskPercent() < 35 ? "Madal" :
                          data.getRiskPercent() < 60 ? "Keskmine" : "Kõrge";

        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; }
                    .header { text-align: center; margin-bottom: 32px; }
                    .logo { font-size: 24px; font-weight: bold; color: #10b981; }
                    h1 { color: #f8fafc; margin: 16px 0 8px; }
                    .risk-score { font-size: 64px; font-weight: bold; color: %s; text-align: center; margin: 24px 0; }
                    .risk-label { text-align: center; font-size: 18px; color: %s; margin-bottom: 24px; }
                    .stats { display: flex; gap: 16px; margin: 24px 0; }
                    .stat { flex: 1; background: #334155; border-radius: 12px; padding: 16px; text-align: center; }
                    .stat-value { font-size: 24px; font-weight: bold; color: #10b981; }
                    .stat-label { font-size: 12px; color: #94a3b8; margin-top: 4px; }
                    .cta { text-align: center; margin: 32px 0; }
                    .cta a { display: inline-block; background: linear-gradient(to right, #10b981, #06b6d4); color: #0f172a; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; }
                    .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 32px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">Tulevikukindlus</div>
                        <h1>Sinu karjääri tulevikukaart</h1>
                        <p style="color: #94a3b8;">%s</p>
                    </div>

                    <div class="risk-score">%d%%</div>
                    <div class="risk-label">%s risk</div>

                    <table width="100%%" cellspacing="8" style="margin: 24px 0;">
                        <tr>
                            <td style="background: #334155; border-radius: 12px; padding: 16px; text-align: center;">
                                <div style="font-size: 24px; font-weight: bold; color: #10b981;">%s</div>
                                <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Muutuste tase</div>
                            </td>
                            <td style="background: #334155; border-radius: 12px; padding: 16px; text-align: center;">
                                <div style="font-size: 24px; font-weight: bold; color: #06b6d4;">%d%%</div>
                                <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Hinnangu kindlus</div>
                            </td>
                        </tr>
                    </table>

                    <div class="cta">
                        <a href="%s">Vaata täielikku analüüsi</a>
                    </div>

                    <div class="footer">
                        <p>See e-mail saadeti, sest sa soovisid oma tulemusi e-mailile.</p>
                        <p>© 2026 Tulevikukindlus</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                riskColor, riskColor,
                data.getRole(),
                data.getRiskPercent(),
                riskLabel,
                riskLabel,
                data.getConfidence(),
                data.getAssessmentUrl()
            );
    }
}
