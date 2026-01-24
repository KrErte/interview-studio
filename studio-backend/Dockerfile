# Spring Boot backend build
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app

# Install Gradle directly (avoids gradle-wrapper.jar issues)
ARG GRADLE_VERSION=8.7
RUN apk add --no-cache bash unzip && \
    wget -q -O /tmp/gradle.zip "https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip" && \
    unzip -q /tmp/gradle.zip -d /opt && \
    ln -s /opt/gradle-${GRADLE_VERSION}/bin/gradle /usr/local/bin/gradle && \
    rm /tmp/gradle.zip

# Copy build files
COPY build.gradle .
COPY settings.gradle .

# Download dependencies (cached layer)
RUN gradle dependencies --no-daemon || true

# Copy source code
COPY src src

# Build the application
RUN gradle bootJar --no-daemon

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
