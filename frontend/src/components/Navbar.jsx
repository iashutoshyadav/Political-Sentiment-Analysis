import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { ChartPie, Search, FileText, Newspaper, LogOut, Menu, X } from 'lucide-react';

const NAV_LINKS = [
    { path: '/dashboard', label: 'Dashboard', icon: <ChartPie className="w-4 h-4" /> },
    { path: '/analysis', label: 'Analysis', icon: <Search className="w-4 h-4" /> },
    { path: '/reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
];

export default function Navbar({ onOpenAuth }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="glass sticky top-0 z-50 border-b border-chalk-200/50 bg-[#fff7ed]/80 backdrop-blur-xl noise-overlay blueprint-grid-subtle h-14 flex items-center">
            <div className="w-full px-6 lg:px-12">
                <div className="flex items-center justify-between">
                    {/* Logo - Refined Architectural Branding */}
                    <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3 group relative">
                        <div className="absolute -top-5 -left-1 text-[5px] font-mono text-primary-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">AUTH / PROT-X</div>
                        <div className="w-8 h-8 bg-dark-950 flex items-center justify-center relative overflow-hidden group-hover:bg-primary-600 transition-colors duration-500">
                            <Newspaper className="w-4 h-4 text-white relative z-10" />
                            <div className="absolute inset-x-0 h-[100%] top-0 bg-gradient-to-t from-white/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-lg font-serif italic text-dark-950 leading-none tracking-tighter">PolitiSense<span className="text-primary-600">.</span></p>
                            <p className="text-[6px] font-mono text-dark-400 uppercase tracking-[0.4em] mt-1 font-black">Intelligence / Ensemble</p>
                        </div>
                    </Link>

                    {/* Desktop nav - Editorial spacing */}
                    <div className="hidden md:flex items-center gap-4 lg:gap-12">
                        {user && NAV_LINKS.map(({ path, label, icon }) => (
                            <Link key={path} to={path}
                                className={`group relative py-2 flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.3em] transition-all duration-300 ${
                                    location.pathname === path ? 'text-primary-600' : 'text-dark-400 hover:text-dark-950'
                                }`}>
                                <span className="text-chalk-300 group-hover:text-primary-400 font-mono text-[7px] opacity-50">0{NAV_LINKS.indexOf({path, label, icon}) +1}</span>
                                {label}
                                {location.pathname === path && (
                                    <div className="absolute -bottom-6 left-0 w-full h-0.5 bg-primary-500" />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {user ? (
                            <>
                                <div className="hidden sm:flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-xs font-bold text-white">
                                        {user.username?.[0]?.toUpperCase()}
                                    </div>
                                    <span className="text-sm text-dark-800 font-medium">{user.username}</span>
                                </div>
                                <button onClick={handleLogout}
                                    className="flex items-center gap-2 text-xs text-dark-500 hover:text-red-600 border border-chalk-300 hover:border-red-200 px-3 py-2 rounded-xl transition-all duration-200">
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-8">
                                <button
                                    onClick={() => onOpenAuth('login')}
                                    className="text-[9px] font-black text-dark-950 uppercase tracking-[0.3em] hover:text-primary-600 transition-colors border-b border-transparent hover:border-primary-600 pb-0.5"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => onOpenAuth('signup')}
                                    className="bg-dark-950 text-white px-8 py-3 transition-all font-serif italic text-sm hover:bg-dark-800 relative group overflow-hidden"
                                >
                                    <span className="relative z-10">Sign Up</span>
                                    <div className="absolute inset-x-0 h-[100%] top-0 bg-gradient-to-t from-primary-500/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                                </button>
                            </div>
                        )}
                        {/* Mobile menu */}
                        <button onClick={() => setMenuOpen(!menuOpen)}
                            className="md:hidden text-dark-500 hover:text-dark-950 p-2 rounded-lg transition-colors">
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
