# Stage 1: Build
# Use a Maven image to get the JDK and Maven build tools
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /usr/src/app
# Copy the entire project context
COPY . .
# Run the Maven build to produce the JAR file
RUN mvn clean package -DskipTests

# Stage 2: Run
# Use a slim Java runtime image for a smaller final image
FROM eclipse-temurin:17-jre
# Install network diagnostic tools
# Network diagnostic tools removed as they are no longer needed
WORKDIR /app
# Copy the built JAR from the 'build' stage
COPY --from=build /usr/src/app/target/fotoland-backend-0.0.1-SNAPSHOT.jar app.jar
# Copy the entrypoint script
COPY entrypoint.sh .
# Make the script executable inside the container
RUN chmod +x entrypoint.sh
# Expose the port the app runs on
EXPOSE 8080
# Set the entrypoint to our script
ENTRYPOINT ["./entrypoint.sh"]