import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Login() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(form.username, form.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen hero-gradient flex items-center justify-center px-4">
            <div className="w-full max-w-md animate-slide-up">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-2xl shadow-blue-500/20">
                        🗞
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
                    <p className="text-slate-400 text-sm">Sign in to PolitiSense</p>
                </div>

                {/* Card */}
                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Username</label>
                            <input type="text" required placeholder="Enter your username"
                                className="input-field" value={form.username}
                                onChange={e => setForm(p => ({ ...p, username: e.target.value }))} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Password</label>
                            <input type="password" required placeholder="Enter your password"
                                className="input-field" value={form.password}
                                onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        <button type="submit" className="btn-primary w-full" disabled={loading}>
                            {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Signing in...</span> : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-slate-700/50 text-center">
                        <p className="text-sm text-slate-500">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Create one</Link>
                        </p>
                    </div>
                </div>

                {/* Demo hint */}
                <p className="text-center text-xs text-slate-600 mt-4">
                    Demo: create any account to get started
                </p>
            </div>
        </div>
    );
}
