import { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Vérification initiale du token (optionnel: appel /auth/me si existait)
        // Ici on suppose que si le token est là, c'est bon, sinon 401 nous déconnectera
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user'); // On stockera l'user aussi pour simplifier

        if (token && storedUser && storedUser !== "undefined") {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Error parsing stored user", e);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const register = async (username, email, password) => {
        try {
            await api('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ username, email, password }),
            });
            // Auto login after register
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
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
