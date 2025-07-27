#!/bin/bash
# scripts/setup.sh

echo "🚀 Configuration de la plateforme Padel..."

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier si Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Créer le fichier .env s'il n'existe pas
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env..."
    cp .env.example .env
    echo "⚠️  Veuillez configurer vos variables d'environnement dans le fichier .env"
fi

# Créer les répertoires nécessaires
mkdir -p database/backups
mkdir -p backend/uploads
mkdir -p logs

# Générer une clé JWT secrète
JWT_SECRET=$(openssl rand -base64 32)
sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env

echo "✅ Configuration terminée!"
echo "💡 Commandes utiles:"
echo "   - Développement: make dev"
echo "   - Production: make prod"
echo "   - Arrêter: make down"
echo "   - Voir les logs: make logs"