# Stage 1: Build
# Use a Maven image to get the JDK and Maven build tools
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /usr/src/app
# Copy the entire project context
COPY . .
# Run the Maven build to produce the JAR file
RUN mvn clean package -DskipTests

# Stage 2: Run
# Use a slim Java runtime image for a smaller final image
FROM openjdk:17-jdk-slim
WORKDIR /app
# Copy the built JAR from the 'build' stage
COPY --from=build /usr/src/app/target/fotoland-backend-0.0.1-SNAPSHOT.jar app.jar
# Expose the port the application will run on
EXPOSE 8080
# Set the command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]