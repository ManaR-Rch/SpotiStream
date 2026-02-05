# Build stage
FROM maven:3.9.11-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy Maven files
COPY backend/pom.xml .
RUN mvn dependency:go-offline

# Copy source code
COPY backend/src ./src

# Build application with Spring Boot
RUN mvn clean package -DskipTests spring-boot:repackage

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy JAR from builder (Spring Boot executable JAR)
COPY --from=builder /app/target/musicstream-api-1.0.0.jar app.jar

# Install curl for health checks
RUN apk add --no-cache curl

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/api/songs || exit 1

# Run application
CMD ["java", "-jar", "app.jar"]
