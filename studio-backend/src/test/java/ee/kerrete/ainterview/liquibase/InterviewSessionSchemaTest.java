package ee.kerrete.ainterview.liquibase;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:liquibase_test;DB_CLOSE_DELAY=-1;MODE=PostgreSQL"
})
class InterviewSessionSchemaTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void interviewProfileJsonColumnExists() {
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'INTERVIEW_SESSION' AND COLUMN_NAME = 'INTERVIEW_PROFILE_JSON'",
            Integer.class
        );
        assertThat(count).isNotNull();
        assertThat(count).isGreaterThan(0);
    }
}

