.PHONY: qa-smoke backend frontend

qa-smoke:
	@bash qa/smoke.sh

backend:
	@cd fotoland-backend && ./mvnw spring-boot:run

frontend:
	@cd fotoland-frontend && npm start