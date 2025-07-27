# Makefile
.PHONY: help setup dev prod down logs clean backup restore test lint format

# Variables
COMPOSE_FILE = docker-compose.yml
COMPOSE_DEV_FILE = docker-compose.dev.yml
PROJECT_NAME = padel-platform

help: ## Afficher l'aide
	@echo "Commandes disponibles:"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

setup: ## Configuration initiale du projet
	@echo "🚀 Configuration de la plateforme Padel..."
	@./scripts/setup.sh

dev: ## Lancer en mode développement avec hot-reload
	@echo "🚀 Lancement en mode développement..."
	@docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_DEV_FILE) up --build

dev-watch: ## Lancer en mode développement avec Docker Watch (Docker Compose v2.22+)
	@echo "🚀 Lancement en mode développement avec hot-reload..."
	@docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_DEV_FILE) watch

prod: ## Lancer en mode production
	@echo "🚀 Lancement en mode production..."
	@docker-compose -f $(COMPOSE_FILE) up -d --build

down: ## Arrêter tous les services
	@echo "⏹️ Arrêt des services..."
	@docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_DEV_FILE) down

logs: ## Voir les logs en temps réel
	@echo "📋 Affichage des logs..."
	@docker-compose -f $(COMPOSE_FILE) logs -f

logs-backend: ## Voir uniquement les logs backend
	@docker-compose -f $(COMPOSE_FILE) logs -f backend

logs-frontend: ## Voir uniquement les logs frontend
	@docker-compose -f $(COMPOSE_FILE) logs -f frontend

clean: ## Nettoyer containers, images et volumes
	@echo "🧹 Nettoyage complet..."
	@docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_DEV_FILE) down -v --remove-orphans
	@docker system prune -af --volumes

clean-dev: ## Nettoyer uniquement les données de développement
	@echo "🧹 Nettoyage environnement de développement..."
	@docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_DEV_FILE) down -v
	@docker volume rm $(PROJECT_NAME)_postgres_dev_data $(PROJECT_NAME)_redis_dev_data 2>/dev/null || true

backup: ## Sauvegarder la base de données
	@echo "💾 Sauvegarde de la base de données..."
	@./scripts/backup.sh

restore: ## Restaurer la base de données
	@echo "📥 Restauration de la base de données..."
	@./scripts/restore.sh

test: ## Lancer les tests
	@echo "🧪 Lancement des tests..."
	@docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_DEV_FILE) exec backend npm test
	@docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_DEV_FILE) exec frontend npm test

lint: ## Vérifier le code (ESLint, Prettier)
	@echo "🔍 Vérification du code..."
	@docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_DEV_FILE) exec backend npm run lint
	@docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_DEV_FILE) exec frontend npm run lint

format: ## Formater le code
	@echo "✨ Formatage du code..."
	@docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_DEV_FILE) exec backend npm run format
	@docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_DEV_FILE) exec frontend npm run format

build-railway: ## Build pour Railway
	@echo "🚄 Build pour Railway..."
	@docker build -f Dockerfile.railway -t padel-platform-railway .

deploy-railway: build-railway ## Déployer sur Railway
	@echo "🚄 Déploiement sur Railway..."
	@railway up

shell-backend: ## Shell dans le container backend
	@docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_DEV_FILE) exec backend sh

shell-frontend: ## Shell dans le container frontend
	@docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_DEV_FILE) exec frontend sh

db-shell: ## Accéder à PostgreSQL
	@docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_DEV_FILE) exec postgres psql -U padel_user -d padel_dev_db

redis-cli: ## Accéder à Redis CLI
	@docker-compose -f $(COMPOSE_FILE) -f $(COMPOSE_DEV_FILE) exec redis redis-cli

status: ## Voir le statut des services
	@docker-compose -f $(COMPOSE_FILE) ps