import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, Package, ShoppingCart, LogOut, Users, Settings, PlusCircle, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItemClass = ({ isActive }) =>
        `flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${isActive
            ? 'bg-ios-blue text-white shadow-[0_0_15px_rgba(10,132,255,0.4)]'
            : 'text-ios-gray hover:bg-white/5 hover:text-white'
        }`;

    const isAdmin = user?.role === 'admin';

    return (
        <div className="flex h-screen bg-black">
            {/* Sidebar Glass */}
            <aside className="w-80 p-6 flex flex-col border-r border-white/5 bg-[#1C1C1E]/30 backdrop-blur-xl hidden md:flex">
                <div className="mb-10 px-4">
                    <h1 className="text-2xl font-bold text-white tracking-wide">Stock OS</h1>
                    <p className="text-xs text-ios-gray mt-1 uppercase tracking-wider">
                        {isAdmin ? 'Administrateur' : 'Vendeur'} • {user?.username}
                    </p>
                </div>

                <nav className="flex-1 space-y-2">
                    <NavLink to="/" className={navItemClass}>
                        <LayoutGrid size={24} />
                        <span className="font-medium text-lg">Dashboard</span>
                    </NavLink>

                    {isAdmin ? (
                        // MENU ADMIN
                        <>
                            <NavLink to="/products" className={navItemClass}>
                                <Package size={24} />
                                <span className="font-medium text-lg">Produits</span>
                            </NavLink>
                            <NavLink to="/orders" className={navItemClass}>
                                <ShoppingCart size={24} />
                                <span className="font-medium text-lg">Ventes Globales</span>
                            </NavLink>
                            <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Administration</div>
                            <NavLink to="/users" className={navItemClass}>
                                <Users size={24} />
                                <span className="font-medium text-lg">Utilisateurs</span>
                            </NavLink>
                        </>
                    ) : (
                        // MENU USER (VENDEUR)
                        <>
                            <NavLink to="/pos" className={navItemClass}>
                                <PlusCircle size={24} />
                                <span className="font-medium text-lg">Nouvelle Vente</span>
                            </NavLink>
                            <NavLink to="/my-sales" className={navItemClass}>
                                <History size={24} />
                                <span className="font-medium text-lg">Mes Ventes</span>
                            </NavLink>
                        </>
                    )}

                    {/* COMMON LINKS */}
                    {/* <NavLink to="/settings" className={navItemClass}>
            <Settings size={24} />
            <span className="font-medium text-lg">Paramètres</span>
          </NavLink> */}
                </nav>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all mt-6"
                >
                    <LogOut size={24} />
                    <span className="font-medium text-lg">Déconnexion</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative rounded-l-[40px] bg-black border-l border-white/5 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
                {/* Top Bar Mobile (visible only on small screens) */}
                <div className="md:hidden p-4 flex justify-between items-center glass sticky top-0 z-50">
                    <span className="font-bold">Stock OS</span>
                    <button onClick={handleLogout}><LogOut size={20} /></button>
                </div>

                <div className="p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
