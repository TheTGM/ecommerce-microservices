# Makefile

# Variables
DOCKER_COMPOSE = docker-compose
ORDERS_DIR = orders
PAYMENTS_DIR = payments

# Colores para output
GREEN = \033[0;32m
NC = \033[0m # No Color

.PHONY: help build up down logs clean init-dev test

help: ## Muestra esta ayuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: ## Construye las imágenes de Docker
	@echo "$(GREEN)Construyendo imágenes de Docker...$(NC)"
	$(DOCKER_COMPOSE) build

up: ## Inicia los servicios
	@echo "$(GREEN)Iniciando servicios...$(NC)"
	$(DOCKER_COMPOSE) up -d

down: ## Detiene los servicios
	@echo "$(GREEN)Deteniendo servicios...$(NC)"
	$(DOCKER_COMPOSE) down

logs: ## Muestra los logs de todos los servicios
	$(DOCKER_COMPOSE) logs -f

logs-orders: ## Muestra los logs del servicio de órdenes
	$(DOCKER_COMPOSE) logs -f orders-service

logs-payments: ## Muestra los logs del servicio de pagos
	$(DOCKER_COMPOSE) logs -f payments-service

clean: ## Limpia contenedores, volúmenes e imágenes
	@echo "$(GREEN)Limpiando contenedores y volúmenes...$(NC)"
	$(DOCKER_COMPOSE) down -v
	docker system prune -f

init-dev: ## Inicializa el entorno de desarrollo
	@echo "$(GREEN)Inicializando entorno de desarrollo...$(NC)"
	chmod +x init-dev.sh
	./init-dev.sh

test-orders: ## Ejecuta tests del servicio de órdenes
	cd $(ORDERS_DIR) && npm test

test-payments: ## Ejecuta tests del servicio de pagos
	cd $(PAYMENTS_DIR) && npm test

restart: down up ## Reinicia todos los servicios

shell-orders: ## Abre una shell en el contenedor de órdenes
	docker exec -it orders-service sh

shell-payments: ## Abre una shell en el contenedor de pagos
	docker exec -it payments-service sh