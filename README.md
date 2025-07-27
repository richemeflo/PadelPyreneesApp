# PadelPyreneesApp
Description
`àaaa`
## Variable d'enironnement RailWay Dashboard

```
# Base de données (Railway génère automatiquement)
DATABASE_URL=postgresql://...

# Redis (Railway génère automatiquement) 
REDIS_URL=redis://...

# JWT
JWT_SECRET=your_super_secret_jwt_key_32_chars_min

# Supabase (optionnel)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# App
NODE_ENV=production
FRONTEND_URL=https://your-app.railway.app
```

## DÉPLOIEMENT SUR RAILWAY
### Étapes de déploiement:

1. Créer un compte Railway sur railway.app
2. Connecter votre repo GitHub :
```
bash
# Pousser votre code sur GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/padel-platform.git
git push -u origin main
```

3. Créer un nouveau projet Railway :
- Cliquer "New Project"
- Sélectionner "Deploy from GitHub repo"
- Choisir votre repository


4. Ajouter PostgreSQL :
- Dans votre projet Railway, cliquer "New"
- Sélectionner "Database" → "PostgreSQL"

5. Ajouter Redis :
- Cliquer "New" → "Database" → "Redis"

6. Configurer les variables :
- Railway génère automatiquement DATABASE_URL et REDIS_URL
- Ajouter manuellement JWT_SECRET, SUPABASE_URL, etc.

7. Railway détecte automatiquement :
- Le railway.toml
- Le Dockerfile à la racine
- Lance le build et le déploiement

## 🚀 COMMANDES UTILES
```
# Développement local
npm run dev

# Build pour production
npm run build

# Test en local avant Railway
docker build -t padel-platform .
docker run -p 3000:3000 padel-platform

# Deploy sur Railway (automatique via GitHub)
git push origin main
```