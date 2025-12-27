require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

async function runMigrations() {
    console.log('🔄 Démarrage des migrations...\n');

    try {
        // Créer la table migrations si elle n'existe pas
        await pool.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Lire tous les fichiers .sql du dossier migrations
        const migrationsDir = __dirname;
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort(); // Important : ordre alphabétique

        for (const file of files) {
            const migrationName = file.replace('.sql', '');

            // Vérifier si déjà appliquée
            const check = await pool.query(
                'SELECT * FROM migrations WHERE name = $1',
                [migrationName]
            );

            if (check.rows.length > 0) {
                console.log(`⏭️  ${migrationName} (déjà appliquée)`);
                continue;
            }

            // Lire et exécuter le fichier SQL
            console.log(`⚙️  Application de ${migrationName}...`);
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

            await pool.query(sql);

            // Marquer comme appliquée
            await pool.query(
                'INSERT INTO migrations (name) VALUES ($1)',
                [migrationName]
            );

            console.log(`✅ ${migrationName} appliquée avec succès\n`);
        }

        console.log('🎉 Toutes les migrations sont à jour !');
    } catch (error) {
        console.error('❌ Erreur lors des migrations:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigrations();
