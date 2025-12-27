// Script compatible Node 18+ (Fetch natif)

// URL de votre Backend
const API_URL = 'http://development-moved-favour-cup.trycloudflare.com:8080/projet-stock/api/auth/register';

async function createAdmin() {
    console.log("👑 Création du compte Admin...");

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'Administrateur',
                email: 'admin@stock.local',
                password: 'admin123',
                role: 'admin'  // C'est ici que la magie opère
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("✅ Compte Admin créé avec succès !");
            console.log("   Email: admin@stock.local");
            console.log("   Pass : admin123");
        } else {
            console.log("❌ Erreur :", data.message);
        }
    } catch (error) {
        console.error("❌ Erreur de connexion :", error.message);
    }
}

createAdmin();
