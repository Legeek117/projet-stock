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
        `flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-4 p-3 md:p-4 rounded-2xl transition-all duration-300 ${isActive
            ? 'bg-ios-blue text-white shadow-[0_0_15px_rgba(10,132,255,0.4)]'
            : 'text-ios-gray hover:bg-white/5 hover:text-white'
        }`;

    const isAdmin = user?.role === 'admin';

    // Navigation items basés sur le rôle
    // Navigation items basés sur le rôle
    const adminNavItems = [
        { to: '/', icon: LayoutGrid, label: 'Dashboard' },
        { to: '/products', icon: Package, label: 'Produits' },
        { to: '/stock', icon: History, label: 'Stock' },
        { to: '/orders', icon: ShoppingCart, label: 'Ventes' },
        { to: '/users', icon: Users, label: 'Équipe' },
    ];

    const userNavItems = [
        { to: '/', icon: LayoutGrid, label: 'Dashboard' },
        { to: '/pos', icon: PlusCircle, label: 'Vente' },
        { to: '/my-sales', icon: History, label: 'Historique' },
    ];

    const navItems = isAdmin ? adminNavItems : userNavItems;

    return (
        <div className="flex flex-col md:flex-row h-screen bg-black">
            {/* Desktop Sidebar (hidden on mobile) */}
            <aside className="hidden md:flex w-80 p-6 flex-col border-r border-white/5 bg-[#1C1C1E]/30 backdrop-blur-xl">
                <div className="mb-10 px-4">
                    <h1 className="text-2xl font-bold text-white tracking-wide">OptiStock</h1>
                    <p className="text-xs text-ios-gray mt-1 uppercase tracking-wider">
                        {isAdmin ? 'Administrateur' : 'Vendeur'} • {user?.username}
                    </p>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                        <NavLink key={item.to} to={item.to} className={navItemClass}>
                            <item.icon size={24} />
                            <span className="font-medium text-lg">{item.label}</span>
                        </NavLink>
                    ))}
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
            <main className="flex-1 overflow-auto relative bg-black pb-20 md:pb-0">
                {/* Mobile Top Bar */}
                <div className="md:hidden sticky top-0 z-40 bg-[#1C1C1E]/95 backdrop-blur-xl border-b border-white/10 p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-lg font-bold text-white">OptiStock</h1>
                            <p className="text-xs text-ios-gray">{user?.username}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Navigation (hidden on desktop) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1C1C1E]/95 backdrop-blur-xl border-t border-white/10">
                <div className={`grid ${isAdmin ? 'grid-cols-5' : 'grid-cols-3'} gap-1 p-2`}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={navItemClass}
                        >
                            <item.icon size={22} strokeWidth={2.5} />
                            <span className="text-xs font-medium mt-0.5">{item.label}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>
        </div>
    );
}
