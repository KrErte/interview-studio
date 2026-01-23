# Spring Boot backend build
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app

# Install bash and dos2unix for gradlew compatibility
RUN apk add --no-cache bash dos2unix

# Copy gradle files
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Fix line endings and make gradlew executable
RUN dos2unix gradlew && chmod +x gradlew

# Download gradle-wrapper.jar if missing (often excluded from git via *.jar rule)
# The wrapper jar is downloaded from the official Gradle GitHub repository
ARG GRADLE_VERSION=8.7
RUN if [ ! -f gradle/wrapper/gradle-wrapper.jar ]; then \
        mkdir -p gradle/wrapper && \
        wget -q -O gradle/wrapper/gradle-wrapper.jar \
        "https://github.com/gradle/gradle/raw/v${GRADLE_VERSION}.0/gradle/wrapper/gradle-wrapper.jar" || \
        wget -q -O gradle/wrapper/gradle-wrapper.jar \
        "https://raw.githubusercontent.com/gradle/gradle/v${GRADLE_VERSION}.0/gradle/wrapper/gradle-wrapper.jar"; \
    fi

# Download dependencies (cached layer)
RUN ./gradlew dependencies --no-daemon || true

# Copy source code
COPY src src

# Build the application
RUN ./gradlew bootJar --no-daemon

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Add non-root user for security
RUN addgroup -g 1001 appgroup && adduser -u 1001 -G appgroup -D appuser

# Copy the built JAR
COPY --from=builder /app/build/libs/backend.jar app.jar

# PostgreSQL JDBC driver is included via Spring Boot
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget -q --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=dev"]
