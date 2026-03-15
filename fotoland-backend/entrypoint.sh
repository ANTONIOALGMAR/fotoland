#!/bin/sh
exec java -Dserver.port=${PORT:-8080} -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-dev} -jar app.jar
