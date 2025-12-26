import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User } from 'lucide-react';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        let result;
        if (isLogin) {
            result = await login(email, password);
        } else {
            result = await register(username, email, password);
        }

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error || "Une erreur est survenue");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
            {/* Background Blobs for Atmosphere */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-ios-blue/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>

            <div className="glass-panel p-10 rounded-[40px] w-full max-w-md relative z-10 flex flex-col gap-8 border border-white/10 transition-all duration-500">
                <div className="text-center">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Stock OS
                    </h1>
                    <p className="text-ios-gray mt-2 text-lg">
                        {isLogin ? 'Bon retour parmi nous' : 'Créer un nouveau compte'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/20 text-red-200 p-3 rounded-xl text-center text-sm border border-red-500/30">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {!isLogin && (
                        <div className="relative group animate-[fadeIn_0.3s_ease-out]">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-ios-gray group-focus-within:text-ios-blue transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Nom d'utilisateur"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-[#2C2C2E]/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-ios-blue/50 transition-all text-lg"
                                required={!isLogin}
                            />
                        </div>
                    )}

                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-ios-gray group-focus-within:text-ios-blue transition-colors" size={20} />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#2C2C2E]/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-ios-blue/50 transition-all text-lg"
                            required
                        />
                    </div>

                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ios-gray group-focus-within:text-ios-blue transition-colors" size={20} />
                        <input
                            type="password"
                            placeholder="Mot de passe"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#2C2C2E]/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-ios-blue/50 transition-all text-lg"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-ios-blue hover:bg-blue-600 text-white font-semibold py-4 rounded-2xl text-lg transition-all shadow-[0_0_20px_rgba(10,132,255,0.3)] hover:shadow-[0_0_30px_rgba(10,132,255,0.5)] active:scale-95 mt-2"
                    >
                        {isLogin ? 'Se connecter' : "S'inscrire"}
                    </button>
                </form>

                <div className="text-center">
                    <button
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        className="text-ios-gray hover:text-white transition-colors text-sm"
                    >
                        {isLogin ? "Pas encore de compte ? Créer un compte" : "Déjà un compte ? Se connecter"}
                    </button>
                </div>
            </div>
        </div>
    );
}
