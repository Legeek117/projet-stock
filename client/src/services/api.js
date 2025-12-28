export const API_BASE = '/api';

export const api = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'x-auth-token': token }),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        // Si token expiré ou invalide, on déconnecte
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Unauthorized');
    }

    // Pour gérer les réponses vides (comme DELETE)
    if (response.status === 204) return null;

    try {
        if (!response.ok) return null;
        return await response.json();
    } catch (err) {
        return null; // Évite de renvoyer l'objet Response qui est truthy
    }
};
