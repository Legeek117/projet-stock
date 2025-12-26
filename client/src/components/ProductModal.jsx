import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { X } from 'lucide-react';

export default function ProductModal({ isOpen, onClose, product, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        stock_quantity: '',
        description: ''
    });

    useEffect(() => {
        if (product) {
            setFormData(product);
        } else {
            setFormData({ name: '', category: '', price: '', stock_quantity: '', description: '' });
        }
    }, [product]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (product) {
                await api(`/products/${product.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                });
            } else {
                await api('/products', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
            }
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'enregistrement");
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>

            {/* Modal Content */}
            <div className="bg-[#1C1C1E] border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl relative z-10 flex flex-col p-8 animate-[scaleIn_0.2s_ease-out]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white">
                        {product ? 'Modifier le Produit' : 'Nouveau Produit'}
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-ios-gray hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-ios-gray mb-1 uppercase tracking-wide">Nom du produit</label>
                        <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-ios-blue outline-none" placeholder="Ex: iPhone 14 Pro" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-ios-gray mb-1 uppercase tracking-wide">Catégorie</label>
                            <input name="category" value={formData.category} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-ios-blue outline-none" placeholder="Electronique" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-ios-gray mb-1 uppercase tracking-wide">Prix (€)</label>
                            <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-ios-blue outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-ios-gray mb-1 uppercase tracking-wide">Quantité en Stock</label>
                        <input required type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-ios-blue outline-none" />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-ios-gray mb-1 uppercase tracking-wide">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-ios-blue outline-none h-24 resize-none"></textarea>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl font-medium text-ios-gray hover:bg-white/5 transition-colors">Annuler</button>
                        <button type="submit" className="px-6 py-3 rounded-xl font-medium bg-ios-blue text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                            {product ? 'Sauvegarder' : 'Ajouter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
