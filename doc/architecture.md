# Architecture Dockerisée - Plateforme Padel Gamifiée

## 1. STRUCTURE DU PROJET

```
padel-platform/
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env.example
├── .gitignore
├── README.md
├── nginx/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── default.conf
├── frontend/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── services/
│   │   └── utils/
│   └── public/
├── backend/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── package.json
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── utils/
│   │   └── config/
│   └── migrations/
├── database/
│   ├── init/
│   │   ├── 01-init.sql
│   │   ├── 02-data.sql
│   │   └── 03-indexes.sql
│   └── backups/
└── scripts/
    ├── setup.sh
    ├── deploy.sh
    └── backup.sh
```

## 2. CONFIGURATION DOCKER

### 2.1 Docker Compose Principal
```yaml
# docker-compose.yml
version: '3.8'

services:
  nginx:
    build: ./nginx
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - frontend
      - backend
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
    networks:
      - padel-network
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      - VITE_API_URL=http://localhost/api
      - VITE_WS_URL=ws://localhost/ws
    volumes:
      - frontend_dist:/app/dist
    networks:
      - padel-network
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://padel_user:padel_password@postgres:5432/padel_db
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend/uploads:/app/uploads
    networks:
      - padel-network
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=padel_db
      - POSTGRES_USER=padel_user
      - POSTGRES_PASSWORD=padel_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
    networks:
      - padel-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U padel_user -d padel_db"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - padel-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
  redis_data:
  frontend_dist:

networks:
  padel-network:
    driver: bridge
```

### 2.2 Docker Compose Développement
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:5000/api
      - VITE_WS_URL=ws://localhost:5000
    volumes:
      - ./frontend:/app
      - /app/node_modules
    networks:
      - padel-network
    command: npm run dev

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://padel_user:padel_password@postgres:5432/padel_db
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=dev_secret_key
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - postgres
      - redis
    networks:
      - padel-network
    command: npm run dev

  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=padel_db
      - POSTGRES_USER=padel_user
      - POSTGRES_PASSWORD=padel_password
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
    networks:
      - padel-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_dev_data:/data
    networks:
      - padel-network

  adminer:
    image: adminer:latest
    ports:
      - "8080:8080"
    networks:
      - padel-network
    depends_on:
      - postgres

volumes:
  postgres_dev_data:
  redis_dev_data:

networks:
  padel-network:
    driver: bridge
```

## 3. DOCKERFILES

### 3.1 Frontend - Production
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
RUN npm ci --only=production

# Copier le code source
COPY . .

# Builder l'application
RUN npm run build

# Stage de production avec Nginx
FROM nginx:alpine

# Copier les fichiers buildés
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier la configuration Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 3.2 Frontend - Développement
```dockerfile
# frontend/Dockerfile.dev
FROM node:18-alpine

WORKDIR /app

# Installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le code source
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

### 3.3 Backend - Production
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# Installer les dépendances
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copier le code source
COPY . .

# Changer le propriétaire des fichiers
RUN chown -R nodeuser:nodejs /app
USER nodeuser

EXPOSE 5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["npm", "start"]
```

### 3.4 Backend - Développement
```dockerfile
# backend/Dockerfile.dev
FROM node:18-alpine

WORKDIR /app

# Installer nodemon globalement
RUN npm install -g nodemon

# Installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le code source
COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
```

## 4. CONFIGURATION NGINX

### 4.1 Configuration principale
```nginx
# nginx/nginx.conf
user nginx;
worker_processes auto;

error_log /var/log/nginx/error.log notice;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    include /etc/nginx/conf.d/*.conf;
}
```

### 4.2 Configuration du site
```nginx
# nginx/default.conf
upstream backend {
    server backend:5000;
}

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/m;
limit_req_zone $binary_remote_addr zone=matchmaking:10m rate=5r/m;

server {
    listen 80;
    server_name localhost;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Frontend static files
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API routes
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://backend/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Matchmaking endpoint (rate limited)
    location /api/matchmaking/ {
        limit_req zone=matchmaking burst=5 nodelay;
        
        proxy_pass http://backend/matchmaking/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /ws {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

## 5. SCRIPTS D'AUTOMATISATION

### 5.1 Script de setup
```bash
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
```

### 5.2 Makefile pour faciliter les commandes
```makefile
# Makefile
.PHONY: help dev prod down logs clean backup restore

help:
	@echo "Commandes disponibles:"
	@echo "  dev      - Lancer en mode développement"
	@echo "  prod     - Lancer en mode production"
	@echo "  down     - Arrêter tous les services"
	@echo "  logs     - Voir les logs"
	@echo "  clean    - Nettoyer les containers et volumes"
	@echo "  backup   - Sauvegarder la base de données"
	@echo "  restore  - Restaurer la base de données"

dev:
	@echo "🚀 Lancement en mode développement..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

prod:
	@echo "🚀 Lancement en mode production..."
	docker-compose up -d --build

down:
	@echo "⏹️ Arrêt des services..."
	docker-compose down

logs:
	@echo "📋 Affichage des logs..."
	docker-compose logs -f

clean:
	@echo "🧹 Nettoyage..."
	docker-compose down -v
	docker system prune -f

backup:
	@echo "💾 Sauvegarde de la base de données..."
	./scripts/backup.sh

restore:
	@echo "📥 Restauration de la base de données..."
	./scripts/restore.sh
```

## 6. CONFIGURATION POUR DÉPLOIEMENT GRATUIT

### 6.1 Railway.app
```toml
# railway.toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile.railway"

[deploy]
startCommand = "docker-compose up"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[env]
NODE_ENV = "production"
```

### 6.2 Dockerfile pour Railway
```dockerfile
# Dockerfile.railway
FROM docker/compose:latest

WORKDIR /app

# Copier les fichiers de configuration
COPY docker-compose.yml .
COPY nginx/ ./nginx/
COPY frontend/dist/ ./frontend/dist/
COPY backend/ ./backend/

# Variables d'environnement Railway
ENV DATABASE_URL=$DATABASE_URL
ENV REDIS_URL=$REDIS_URL

# Exposer le port
EXPOSE $PORT

CMD ["docker-compose", "up"]
```

### 6.3 Render.com (Alternative)
```yaml
# render.yaml
services:
  - type: web
    name: padel-platform
    env: docker
    dockerfilePath: ./Dockerfile.render
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: padel-db
          property: connectionString
    
databases:
  - name: padel-db
    databaseName: padel_db
    user: padel_user
```

## 7. MONITORING ET LOGS

### 7.1 Configuration des logs
```yaml
# docker-compose.logging.yml (à merger)
version: '3.8'

x-logging: &default-logging
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"

services:
  nginx:
    logging: *default-logging
    
  backend:
    logging: *default-logging
    
  frontend:
    logging: *default-logging
```

### 7.2 Healthchecks
```javascript
// backend/healthcheck.js
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/health',
  method: 'GET',
  timeout: 2000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

req.on('error', () => {
  process.exit(1);
});

req.on('timeout', () => {
  req.destroy();
  process.exit(1);
});

req.end();
```

## 8. SÉCURITÉ

### 8.1 Variables d'environnement
```bash
# .env.example
# Base de données
DATABASE_URL=postgresql://padel_user:padel_password@postgres:5432/padel_db
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Supabase (si utilisé)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here

# Email (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Production
NODE_ENV=production
PORT=5000
```

### 8.2 Configuration SSL avec Let's Encrypt
```yaml
# docker-compose.ssl.yml
version: '3.8'

services:
  certbot:
    image: certbot/certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    command: certonly --webroot -w /var/www/certbot --force-renewal --email your@email.com -d your-domain.com --agree-tos

  nginx:
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
```

Cette architecture dockerisée vous permettra de :
- **Développer facilement** avec hot-reload
- **Déployer gratuitement** sur Railway, Render ou similaire  
- **Scaler automatiquement** selon la charge
- **Maintenir facilement** avec des containers isolés
- **Sauvegarder/restaurer** simplement la base de données
- **Monitorer** les performances et erreurs

Le tout reste dans les tiers gratuits des services cloud ! 🚀