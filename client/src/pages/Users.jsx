import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, Plus, Trash2, Mail, Calendar, Shield } from 'lucide-react';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [newUser, setNewUser] = useState({ username: '', email: '', password: '' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await api('/users');
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erreur users", error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
            try {
                await api(`/users/${id}`, { method: 'DELETE' });
                fetchUsers();
            } catch (error) {
                alert("Impossible de supprimer cet utilisateur (ou vous-même).");
            }
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api('/users', {
                method: 'POST',
                body: JSON.stringify(newUser)
            });
            setShowModal(false);
            setNewUser({ username: '', email: '', password: '' });
            fetchUsers();
        } catch (error) {
            alert("Erreur lors de la création");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Utilisateurs</h2>
                    <p className="text-ios-gray mt-1">Gérez votre équipe de vente</p>
                </div>
                <button onClick={() => setShowModal(true)} className="bg-ios-blue hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg transition-all flex items-center gap-2">
                    <Plus size={18} /> Nouvel Employé
                </button>
            </div>

            <div className="glass-panel overflow-hidden rounded-[24px]">
                {loading ? <div className="p-10 text-center">Chargement...</div> : (
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/5 text-ios-gray text-xs uppercase">
                            <tr>
                                <th className="p-6">Utilisateur</th>
                                <th className="p-6">Email</th>
                                <th className="p-6">Rôle</th>
                                <th className="p-6">Depuis le</th>
                                <th className="p-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {(Array.isArray(users) ? users : []).map(u => (
                                <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                {u.username?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-white">{u.username}</span>
                                        </div>
                                    </td>
                                    <td className="p-6 text-gray-300 flex items-center gap-2">
                                        <Mail size={14} className="text-ios-gray" /> {u.email}
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit border ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}>
                                            <Shield size={12} /> {u.role === 'admin' ? 'Admin' : 'Vendeur'}
                                        </span>
                                    </td>
                                    <td className="p-6 text-sm text-ios-gray">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} /> {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        {u.role !== 'admin' && ( // On protège sommairement l'admin principal visuellement
                                            <button onClick={() => handleDelete(u.id)} className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Création */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
                    <div className="bg-[#1C1C1E] border border-white/10 w-full max-w-md rounded-3xl p-8 relative z-10 animate-[scaleIn_0.2s_ease-out]">
                        <h3 className="text-2xl font-bold text-white mb-6">Ajouter un vendeur</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-ios-gray uppercase">Pseudo</label>
                                <input className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-ios-blue outline-none"
                                    value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} required />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-ios-gray uppercase">Email</label>
                                <input type="email" className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-ios-blue outline-none"
                                    value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-ios-gray uppercase">Mot de passe provisoire</label>
                                <input type="text" className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-ios-blue outline-none"
                                    value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-3 rounded-xl text-ios-gray hover:bg-white/5">Annuler</button>
                                <button type="submit" className="px-6 py-3 rounded-xl bg-ios-blue text-white hover:bg-blue-600 font-medium">Créer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
