FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /build

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn clean package -DskipTests

FROM amazoncorretto:21
WORKDIR /app

COPY --from=build /build/target/restaurant-backend*.jar app.jar

EXPOSE 8088

ARG APP_VERSION=unknown
ENV APP_VERSION=${APP_VERSION}
ENTRYPOINT ["java", "-jar", "app.jar"]
