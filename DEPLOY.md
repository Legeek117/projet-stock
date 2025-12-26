# Guide de Déploiement - Serveur Ubuntu

Ce guide explique comment installer l'application `project-stock` sur votre serveur dans `/srv/project-stock`.

## 1. Récupérer le projet
Connectez-vous à votre serveur et allez dans `/srv/` :
```bash
cd /srv/
sudo git clone https://github.com/Legeek117/projet-stock.git
cd project-stock
```

## 2. Démarrer la Base de Données (Docker)
C'est ici que la magie opère. Docker va télécharger PostgreSQL et créer la base de données automatiquement grâce au fichier `init.sql`.

1. Allez dans le dossier DB :
   ```bash
   cd docker-db
   ```
2. **IMPORTANT** : Créez le fichier `.env` avec vos mots de passe (car il n'est pas sur GitHub) :
   ```bash
   nano .env
   ```
   *Collez ceci dedans (modifiez les mots de passe si vous voulez) :*
   ```ini
   POSTGRES_USER=imvoidroot
   POSTGRES_PASSWORD=H@ck2007ir
   POSTGRES_DB=stockdb
   ```
3. Lancez le conteneur :
   ```bash
   docker-compose up -d
   ```
   *Vérifiez que tout tourne avec `docker ps`.*

## 3. Démarrer le Backend
1. Allez dans le dossier backend :
   ```bash
   cd ../backend
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Créez le fichier `.env` pour le serveur :
   ```bash
   nano .env
   ```
   *Collez ceci :*
   ```ini
   PORT=3000
   DB_USER=imvoidroot
   DB_PASSWORD=H@ck2007ir
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=stockdb
   JWT_SECRET=super_secret_cle_a_changer
   ```
4. Lancez le serveur (avec PM2 pour qu'il tourne en arrière-plan) :
   ```bash
   pm2 start server.js --name "stock-api"
   ```

## 4. Configuration Nginx (Reverse Proxy)
Ajoutez ceci dans votre configuration Nginx (`/etc/nginx/sites-available/...`) pour rendre l'API accessible :

```nginx
location /projet-stock/ {
    proxy_pass http://localhost:3000/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```
Redémarrez Nginx : `sudo systemctl restart nginx`.

## Félicitations !
Votre API est accessible via votre Tunnel Cloudflare + Nginx (ex: `https://votre-site.com/stock/api/`).
