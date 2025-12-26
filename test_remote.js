// Native fetch is used (Node 18+)

// URL fournie par l'utilisateur
const BASE_URL = 'http://development-moved-favour-cup.trycloudflare.com:8080/projet-stock';

async function verifyDeployment() {
    console.log(`🔍 Vérification de l'API sur : ${BASE_URL}`);

    try {
        // 1. Test Root
        console.log('\n1️⃣  Test de connexion au serveur (Root)...');
        try {
            const resRoot = await fetch(`${BASE_URL}/`);
            if (resRoot.ok) {
                const data = await resRoot.json();
                console.log('✅ Succès :', data.message);
            } else {
                console.error('❌ Erreur Root:', resRoot.status, resRoot.statusText);
            }
        } catch (e) { console.error("❌ Echec connexion Root", e.message); }

        // 2. Test Database (Products)
        console.log('\n2️⃣  Test de la Base de Données (Récupération des produits)...');
        try {
            const resProducts = await fetch(`${BASE_URL}/api/products`);
            if (resProducts.ok) {
                const products = await resProducts.json();
                console.log(`✅ Base de données connectée ! ${products.length} produits trouvés.`);
            } else {
                console.log('❌ Erreur DB (Products):', resProducts.status);
            }
        } catch (e) { console.error("❌ Echec connexion DB", e.message); }

        // 3. Test Auth (Login Crash Check)
        console.log('\n3️⃣  Test DIAGNOSTIC AUTH (Vérification Erreur 500)...');
        try {
            // On tente de se connecter avec un user qui n'existe pas
            const resAuth = await fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'test_crash@test.com', password: 'password' })
            });

            if (resAuth.status === 400) {
                const data = await resAuth.json();
                if (data.message === 'Invalid Credentials') {
                    console.log('✅ Le module Auth fonctionne (Renvoie bien 400 pour mauvais user).');
                    console.log('   => Le problème 500 vient peut-être de la création de user (Register).');
                } else {
                    console.log('⚠️  Réponse 400 inattendue:', data);
                }
            } else if (resAuth.status === 500) {
                console.error('🚨 ERREUR CRITIQUE 500 DÉTECTÉE !');
                console.error('   Cause probable : Manque de variable d environnement sur le serveur.');
                console.error('   Vérifiez que JWT_SECRET est bien défini dans backend/.env');
            } else {
                console.log('ℹ️  Statut retourné :', resAuth.status);
            }
        } catch (e) { console.error("❌ Echec appel Auth", e.message); }

    } catch (error) {
        console.error('🚨 Erreur script :', error.message);
    }
}

verifyDeployment();
