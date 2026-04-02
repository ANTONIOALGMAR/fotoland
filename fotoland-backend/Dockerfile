FROM eclipse-temurin:17-jdk-jammy AS builder
WORKDIR /app
COPY . .
RUN ./mvnw -DskipTests package

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=builder /app/target/fotoland-backend-0.0.1-SNAPSHOT.jar ./fotoland-backend.jar
COPY --from=builder /app/scripts/start-backend.sh ./scripts/start-backend.sh
RUN chmod +x ./scripts/start-backend.sh

ENTRYPOINT ["./scripts/start-backend.sh"]
