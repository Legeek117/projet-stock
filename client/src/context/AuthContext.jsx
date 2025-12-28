import { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [preferences, setPreferences] = useState({
        primary_color: '#0A84FF',
        dark_mode: true,
        compact_view: false
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser && storedUser !== "undefined") {
            try {
                setUser(JSON.parse(storedUser));
                fetchPreferences();
            } catch (e) {
                console.error("Error parsing stored user", e);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    // Appliquer le thème quand les préférences changent
    useEffect(() => {
        if (preferences?.primary_color) {
            document.documentElement.style.setProperty('--primary-color', preferences.primary_color);
        }
    }, [preferences]);

    const fetchPreferences = async () => {
        try {
            const data = await api('/settings/preferences');
            if (data) setPreferences(data);
        } catch (err) {
            console.error("Erreur chargement préférences", err);
        }
    };

    const updatePreferences = async (newPrefs) => {
        try {
            const data = await api('/settings/preferences', {
                method: 'PUT',
                body: JSON.stringify(newPrefs)
            });
            if (data) setPreferences(data);
            return { success: true };
        } catch (err) {
            console.error(err);
            return { success: false };
        }
    };

    const register = async (username, email, password) => {
        try {
            await api('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ username, email, password }),
            });
            return await login(email, password);
        } catch (err) {
            console.error(err);
            return { success: false, error: err.message || 'Erreur lors de l inscription' };
        }
    };

    const login = async (email, password) => {
        try {
            const res = await api('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));
            setUser(res.user);
            await fetchPreferences(); // Charger les préférences après login
            return { success: true };
        } catch (err) {
            console.error(err);
            return { success: false, error: 'Identifiants invalides' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        // Reset theme
        document.documentElement.style.setProperty('--primary-color', '#0A84FF');
    };

    return (
        <AuthContext.Provider value={{ user, loading, preferences, updatePreferences, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
