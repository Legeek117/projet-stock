# Migrations de Base de Données

Ce dossier contient les migrations SQL pour faire évoluer le schéma de la base de données sans perdre les données.

## 📋 Comment créer une nouvelle migration

1. Créez un fichier `XXX_description.sql` (ex: `002_add_user_roles.sql`)
2. Numérotez dans l'ordre (001, 002, 003...)
3. Écrivez votre SQL avec `IF NOT EXISTS` pour éviter les erreurs

Exemple :
```sql
-- Migration 002 : Ajout du champ avatar
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255);
INSERT INTO migrations (name) VALUES ('002_add_user_avatar') ON CONFLICT DO NOTHING;
```

## 🚀 Exécuter les migrations

### En local ou sur le serveur :
```bash
cd backend/migrations
node run-migrations.js
```

### Automatiquement au démarrage (optionnel) :
Ajoutez dans `backend/package.json` :
```json
"scripts": {
  "migrate": "node migrations/run-migrations.js",
  "dev": "npm run migrate && nodemon server.js"
}
```

## 📊 Vérifier l'état des migrations

```sql
SELECT * FROM migrations ORDER BY applied_at DESC;
```

## ⚠️ Règles importantes

- ✅ **Toujours** utiliser `IF NOT EXISTS` / `IF EXISTS`
- ✅ **Jamais** modifier une migration déjà appliquée (créer une nouvelle)
- ✅ **Tester** en local avant de déployer
- ✅ **Versionner** les fichiers de migration dans Git
