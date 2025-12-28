import { useState } from 'react';
import { Settings as SettingsIcon, Palette, Monitor, Zap, Bell, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
    const { logout, user } = useAuth();
    const [primaryColor, setPrimaryColor] = useState('#0A84FF');

    const colors = [
        { name: 'Bleu iOS', hex: '#0A84FF' },
        { name: 'Indigo', hex: '#5E5CE6' },
        { name: 'Vert', hex: '#34C759' },
        { name: 'Orange', hex: '#FF9500' },
        { name: 'Rose', hex: '#FF2D55' },
        { name: 'Pourpre', hex: '#AF52DE' }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-ios-blue/10 rounded-[22px] flex items-center justify-center text-ios-blue text-3xl">
                    <SettingsIcon size={32} strokeWidth={2.5} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-white">Réglages</h2>
                    <p className="text-ios-gray">Personnalisez votre expérience OptiStock</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Menu latéral réglages */}
                <div className="space-y-2">
                    {[
                        { icon: Palette, label: 'Apparence', active: true },
                        { icon: Bell, label: 'Notifications', active: false },
                        { icon: Monitor, label: 'Affichage', active: false },
                        { icon: Shield, label: 'Sécurité', active: false },
                        { icon: Zap, label: 'Abonnement', active: false }
                    ].map((item, i) => (
                        <button
                            key={i}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${item.active ? 'bg-ios-blue text-white shadow-lg shadow-ios-blue/20' : 'text-ios-gray hover:bg-white/5'
                                }`}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </button>
                    ))}

                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-4 mt-8 rounded-xl font-bold text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/20"
                    >
                        <LogOut size={20} />
                        Déconnexion
                    </button>
                </div>

                {/* Contenu principal */}
                <div className="md:col-span-2 space-y-6">
                    <div className="glass-panel p-8 rounded-[32px] border border-white/5 space-y-8">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <Palette className="text-ios-blue" size={20} />
                                Thème visuel
                            </h3>
                            <p className="text-sm text-ios-gray mb-6">Choisissez la couleur d'accentuation de l'interface.</p>

                            <div className="grid grid-cols-3 gap-4">
                                {colors.map(color => (
                                    <button
                                        key={color.hex}
                                        onClick={() => setPrimaryColor(color.hex)}
                                        className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${primaryColor === color.hex ? 'border-ios-blue bg-ios-blue/10' : 'border-white/5 bg-white/5 hover:border-white/10'
                                            }`}
                                    >
                                        <div className="w-8 h-8 rounded-full shadow-inner" style={{ backgroundColor: color.hex }}></div>
                                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">{color.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5">
                            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <Monitor className="text-ios-blue" size={20} />
                                Mode Sombre
                            </h3>
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div>
                                    <p className="text-white font-bold">Toujours Sombre</p>
                                    <p className="text-[10px] text-ios-gray uppercase mt-1">Économise la batterie et vos yeux</p>
                                </div>
                                <div className="w-12 h-6 bg-ios-blue rounded-full relative p-1 shadow-inner">
                                    <div className="w-4 h-4 bg-white rounded-full absolute right-1"></div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5">
                            <div className="bg-ios-blue/5 p-6 rounded-3xl border border-ios-blue/10 flex items-start gap-4">
                                <Zap className="text-ios-blue mt-1" />
                                <div>
                                    <h4 className="font-bold text-white">Version Professionnelle</h4>
                                    <p className="text-sm text-ios-gray mt-1">Vous utilisez actuellement l'édition standard d'OptiStock.</p>
                                    <button className="mt-4 text-ios-blue font-black text-xs uppercase tracking-widest hover:underline">En savoir plus</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-red-500/5 p-8 rounded-[32px] border border-red-500/10 flex justify-between items-center">
                        <div>
                            <h4 className="font-bold text-white">Zone de danger</h4>
                            <p className="text-xs text-ios-gray mt-1">Supprimer mon compte et toutes les données associées.</p>
                        </div>
                        <button className="px-6 py-2 rounded-xl bg-red-500/10 text-red-500 font-bold text-sm hover:bg-red-500 hover:text-white transition-all">Supprimer</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
