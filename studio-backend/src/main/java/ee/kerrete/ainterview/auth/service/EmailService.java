package ee.kerrete.ainterview.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Reset Your Password - CareerRisk");
            helper.setFrom("noreply@careerrisk.ee");

            String html = """
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <div style="text-align: center; margin-bottom: 32px;">
                        <h1 style="color: #1c1917; font-size: 24px; margin: 0;">CareerRisk</h1>
                    </div>
                    <div style="background: #ffffff; border: 1px solid #e7e5e4; padding: 32px;">
                        <h2 style="color: #1c1917; font-size: 20px; margin: 0 0 16px;">Reset Your Password</h2>
                        <p style="color: #57534e; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                            We received a request to reset your password. Click the button below to create a new password.
                            This link will expire in 1 hour.
                        </p>
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="%s" style="display: inline-block; background: #1c1917; color: #ffffff; padding: 14px 32px; text-decoration: none; font-size: 14px; font-weight: 600;">
                                Reset Password
                            </a>
                        </div>
                        <p style="color: #a8a29e; font-size: 12px; line-height: 1.5; margin: 0;">
                            If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
                        </p>
                    </div>
                    <p style="color: #a8a29e; font-size: 11px; text-align: center; margin-top: 24px;">
                        &copy; CareerRisk. All rights reserved.
                    </p>
                </div>
                """.formatted(resetLink);

            helper.setText(html, true);
            mailSender.send(message);
            log.info("Password reset email sent to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send password reset email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }
}
