# ===== BUILD STAGE =====
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /build

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn clean package -DskipTests


# ===== RUNTIME STAGE =====
FROM amazoncorretto:21
ARG PROFILE=dev
ARG APP_VERSION=1.0.0

WORKDIR /app
COPY --from=build /build/target/restaurant-backend*.jar app.jar

EXPOSE 8088

ENV DB_URL=jdbc:postgresql://localhost:5432/r_pg_sql
ENV ACTIVE_PROFILE=${PROFILE}

CMD ["java", "-jar", "-Dspring.profiles.active=${ACTIVE_PROFILE}", "-Dspring.datasource.url=${DB_URL}", "app.jar"]
