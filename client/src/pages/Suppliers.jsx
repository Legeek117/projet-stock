import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Users, Plus, Phone, Mail, MapPin, Search, Trash2 } from 'lucide-react';

export default function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSupplier, setNewSupplier] = useState({ name: '', phone: '', email: '', address: '' });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const data = await api('/purchases/suppliers');
            setSuppliers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setSuppliers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api('/purchases/suppliers', {
                method: 'POST',
                body: JSON.stringify(newSupplier)
            });
            setIsModalOpen(false);
            setNewSupplier({ name: '', phone: '', email: '', address: '' });
            fetchSuppliers();
        } catch (err) {
            console.error(err);
        }
    };

    const filteredSuppliers = (Array.isArray(suppliers) ? suppliers : []).filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Fournisseurs</h2>
                    <p className="text-ios-gray mt-1">Gérez vos relations d'approvisionnement</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-ios-blue text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-ios-blue/20"
                >
                    <Plus size={20} /> Nouveau Fournisseur
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ios-gray" size={20} />
                <input
                    type="text"
                    placeholder="Rechercher un fournisseur..."
                    className="w-full bg-[#1C1C1E] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-ios-blue transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-48 bg-white/5 animate-pulse rounded-3xl"></div>)
                ) : filteredSuppliers.map(supplier => (
                    <div key={supplier.id} className="glass-panel p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-ios-blue/10 rounded-2xl flex items-center justify-center text-ios-blue">
                                <Users size={24} />
                            </div>
                            <div className="text-xs font-bold text-ios-gray bg-white/5 px-3 py-1 rounded-full uppercase">
                                ID #{supplier.id}
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-4">{supplier.name}</h3>

                        <div className="space-y-3">
                            {supplier.phone && (
                                <div className="flex items-center gap-3 text-ios-gray text-sm">
                                    <Phone size={16} /> {supplier.phone}
                                </div>
                            )}
                            {supplier.email && (
                                <div className="flex items-center gap-3 text-ios-gray text-sm">
                                    <Mail size={16} /> {supplier.email}
                                </div>
                            )}
                            {supplier.address && (
                                <div className="flex items-start gap-3 text-ios-gray text-sm">
                                    <MapPin size={16} className="mt-0.5 shrink-0" />
                                    <span className="line-clamp-2">{supplier.address}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/5 flex justify-end">
                            <button className="text-[10px] font-bold text-white/20 hover:text-red-400 uppercase tracking-widest transition-colors flex items-center gap-1">
                                <Trash2 size={12} /> Supprimer
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de création */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
                    <form onSubmit={handleCreate} className="bg-[#1C1C1E] border border-white/10 w-full max-w-md rounded-3xl p-8 relative z-10 shadow-2xl">
                        <h3 className="text-2xl font-bold text-white mb-6">Nouveau Fournisseur</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-ios-gray uppercase block mb-2 ml-1">Nom complet</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none focus:ring-1 focus:ring-ios-blue"
                                    value={newSupplier.name}
                                    onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-ios-gray uppercase block mb-2 ml-1">Téléphone</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none focus:ring-1 focus:ring-ios-blue"
                                    value={newSupplier.phone}
                                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-ios-gray uppercase block mb-2 ml-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none focus:ring-1 focus:ring-ios-blue"
                                    value={newSupplier.email}
                                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-ios-gray uppercase block mb-2 ml-1">Adresse</label>
                                <textarea
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none focus:ring-1 focus:ring-ios-blue resize-none"
                                    rows="3"
                                    value={newSupplier.address}
                                    onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3 rounded-xl text-ios-gray hover:bg-white/5 font-bold transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-3 rounded-xl bg-ios-blue text-white font-bold hover:bg-blue-600 transition-all"
                            >
                                Créer
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
