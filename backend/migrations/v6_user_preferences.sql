-- Table pour les préférences d'affichage
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    primary_color VARCHAR(20) DEFAULT '#0A84FF',
    dark_mode BOOLEAN DEFAULT true,
    compact_view BOOLEAN DEFAULT false,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
