import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { ChartPie, Search, FileText, Newspaper, LogOut, Menu, X } from 'lucide-react';

const NAV_LINKS = [
    { path: '/dashboard', label: 'Dashboard', icon: <ChartPie className="w-4 h-4" /> },
    { path: '/analysis', label: 'Analysis', icon: <Search className="w-4 h-4" /> },
    { path: '/reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
];

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="glass sticky top-0 z-50 border-b border-slate-700/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-lg text-white shadow-lg group-hover:shadow-blue-500/25 transition-shadow">
                            <Newspaper className="w-5 h-5" />
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-sm font-bold text-white leading-none">PolitiSense</p>
                            <p className="text-xs text-slate-500 leading-none">Sentiment Analysis</p>
                        </div>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map(({ path, label, icon }) => (
                            <Link key={path} to={path}
                                className={location.pathname === path ? 'nav-link-active' : 'nav-link'}>
                                <span>{icon}</span>
                                <span>{label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {user && (
                            <div className="hidden sm:flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
                                    {user.username?.[0]?.toUpperCase()}
                                </div>
                                <span className="text-sm text-slate-300 font-medium">{user.username}</span>
                            </div>
                        )}
                        <button onClick={handleLogout}
                            className="flex items-center gap-2 text-xs text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/50 px-3 py-2 rounded-xl transition-all duration-200">
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                        {/* Mobile menu */}
                        <button onClick={() => setMenuOpen(!menuOpen)}
                            className="md:hidden text-slate-400 hover:text-white p-2 rounded-lg transition-colors">
                            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {menuOpen && (
                    <div className="md:hidden pb-3 flex flex-col gap-1">
                        {NAV_LINKS.map(({ path, label, icon }) => (
                            <Link key={path} to={path} onClick={() => setMenuOpen(false)}
                                className={location.pathname === path ? 'nav-link-active' : 'nav-link'}>
                                <span>{icon}</span>
                                <span>{label}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
}
