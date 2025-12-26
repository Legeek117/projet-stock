const fetch = require('node-fetch'); // Needs node-fetch installed or use built-in fetch in Node 18+

// URL fournie par l'utilisateur
const BASE_URL = 'http://development-moved-favour-cup.trycloudflare.com:8080/projet-stock';

async function verifyDeployment() {
    console.log(`🔍 Vérification de l'API sur : ${BASE_URL}`);

    try {
        // 1. Test Root
        console.log('\n1️⃣  Test de connexion au serveur (Root)...');
        const resRoot = await fetch(`${BASE_URL}/`);
        if (resRoot.ok) {
            const data = await resRoot.json();
            console.log('✅ Succès :', data.message);
        } else {
            console.error('❌ Erreur Root:', resRoot.status, resRoot.statusText);
        }

        // 2. Test Database (Products)
        console.log('\n2️⃣  Test de la Base de Données (Récupération des produits)...');
        const resProducts = await fetch(`${BASE_URL}/api/products`);
        if (resProducts.ok) {
            const products = await resProducts.json();
            if (Array.isArray(products) && products.length > 0) {
                console.log(`✅ Base de données connectée ! ${products.length} produits trouvés.`);
                console.log('   Exemple:', products[0].name, '-', products[0].price, '€');
            } else {
                console.log('⚠️  Base de données connectée mais vide (ou format inattendu).');
                console.log(products);
            }
        } else {
            console.error('❌ Erreur DB (Products):', resProducts.status, resProducts.statusText);
            console.log('   Si erreur 500 = Problème connexion DB ou Code SQL.');
            const text = await resProducts.text();
            console.log('   Détail:', text.substring(0, 200));
        }

    } catch (error) {
        console.error('🚨 Erreur réseau ou critique :', error.message);
    }
}

// Check Node version for fetch compatibility
if (Number(process.versions.node.split('.')[0]) < 18) {
    console.log("⚠️  Attention: Ce script utilise 'fetch'. Si vous êtes sous Node < 18, installez node-fetch ou mettez à jour Node.");
}

verifyDeployment();
