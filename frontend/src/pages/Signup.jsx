import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
    const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
        setLoading(true);
        try {
            await signup(form.username, form.email, form.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fields = [
        { key: 'username', label: 'Username', type: 'text', placeholder: 'Choose a username' },
        { key: 'email', label: 'Email Address', type: 'email', placeholder: 'your@email.com' },
        { key: 'password', label: 'Password', type: 'password', placeholder: 'Min. 6 characters' },
        { key: 'confirm', label: 'Confirm Password', type: 'password', placeholder: 'Repeat your password' },
    ];

    return (
        <div className="min-h-screen hero-gradient flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md animate-slide-up">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-2xl shadow-blue-500/20">🗞</div>
                    <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
                    <p className="text-slate-400 text-sm">Start analyzing political sentiment today</p>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {fields.map(({ key, label, type, placeholder }) => (
                            <div key={key}>
                                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">{label}</label>
                                <input type={type} required placeholder={placeholder}
                                    className="input-field" value={form[key]}
                                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
                            </div>
                        ))}

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">{error}</div>
                        )}

                        <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
                            {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Creating...</span> : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-slate-700/50 text-center">
                        <p className="text-sm text-slate-500">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
