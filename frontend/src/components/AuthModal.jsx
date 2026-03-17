import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AuthModal({ isOpen, onClose, initialType = 'login' }) {
    const [type, setType] = useState(initialType);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
    const { login, signup } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        setType(initialType);
        // Clear form when opening
        if (isOpen) {
            setForm({ username: '', email: '', password: '', confirm: '' });
        }
    }, [initialType, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (type === 'login') {
                await login(form.username, form.password);
                toast.success('Successfully logged in');
            } else {
                if (form.password !== form.confirm) {
                    throw new Error('Passwords do not match');
                }
                await signup(form.username, form.email, form.password);
                toast.success('Account created successfully');
            }
            onClose();
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.message || (type === 'login' ? 'Login failed' : 'Signup failed'));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-dark-950/40 backdrop-blur-md cursor-pointer"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-lg bg-white/80 backdrop-blur-2xl border border-white/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden rounded-[2.5rem]"
                >
                    {/* Interior Design Elements */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600" />
                    <div className="absolute top-8 right-8 text-[8px] font-mono text-dark-300 uppercase tracking-widest pointer-events-none select-none">Auth Protocol / {type.toUpperCase()}</div>

                    <div className="p-8 sm:p-10 pt-16">
                        {/* Header Section */}
                        <div className="mb-8">
                            <div className="w-10 h-10 bg-dark-950 flex items-center justify-center mb-6 relative group">
                                <ShieldCheck className="w-5 h-5 text-white relative z-10" />
                                <div className="absolute inset-0 bg-primary-500 translate-x-1.5 translate-y-1.5 -z-10 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform" />
                            </div>
                            <h2 className="text-3xl font-serif italic text-dark-950 mb-1 leading-tight tracking-tight">
                                {type === 'login' ? 'Welcome back' : 'Join the elite'}
                            </h2>
                            <p className="text-dark-500 text-xs font-light font-serif italic">
                                {type === 'login' 
                                    ? 'Decoding political narratives through intelligence.' 
                                    : 'Initialise your access to deep political analysis.'}
                            </p>
                        </div>

                        {/* Form Section */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-3">
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-300 group-focus-within:text-primary-500 transition-colors">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        required
                                        className="w-full bg-white border border-chalk-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none placeholder:text-dark-300"
                                        value={form.username}
                                        onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                                    />
                                </div>

                                {type === 'signup' && (
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-300 group-focus-within:text-primary-500 transition-colors">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="Email Address"
                                            required
                                            className="w-full bg-white border border-chalk-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none placeholder:text-dark-300"
                                            value={form.email}
                                            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                        />
                                    </div>
                                )}

                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-300 group-focus-within:text-primary-500 transition-colors">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="Security Password"
                                        required
                                        className="w-full bg-white border border-chalk-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none placeholder:text-dark-300"
                                        value={form.password}
                                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    />
                                </div>

                                {type === 'signup' && (
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-300 group-focus-within:text-primary-500 transition-colors">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="password"
                                            placeholder="Confirm Password"
                                            required
                                            className="w-full bg-white border border-chalk-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none placeholder:text-dark-300"
                                            value={form.confirm}
                                            onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                                        />
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-dark-950 text-white rounded-2xl py-4 px-6 text-sm font-bold flex items-center justify-center gap-3 hover:bg-dark-900 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                            >
                                <span className="relative z-10">{loading ? 'Processing...' : (type === 'login' ? 'Access Portal' : 'Register protocol')}</span>
                                {!loading && <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />}
                                <div className="absolute inset-0 bg-primary-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            </button>
                        </form>

                        {/* Footer Toggle Section */}
                        <div className="mt-8 text-center">
                            <p className="text-dark-400 text-[10px] font-medium uppercase tracking-widest mb-2">
                                {type === 'login' ? 'No Access protocol?' : 'Already have protocol?'}
                            </p>
                            <button
                                onClick={() => setType(type === 'login' ? 'signup' : 'login')}
                                className="text-dark-950 text-xs font-serif italic border-b border-dark-950/20 hover:border-primary-500 transition-colors pb-0.5"
                            >
                                {type === 'login' ? 'Initialise New Membership' : 'Authenticate Existing Protocol'}
                            </button>
                        </div>
                    </div>
                    
                    {/* Bottom Aesthetic Bar */}
                    <div className="px-8 py-4 bg-chalk-50/50 border-t border-chalk-100 flex items-center justify-between">
                        <span className="text-[6px] font-mono text-dark-300 uppercase tracking-widest">Protocol-X / v12.8</span>
                        <div className="flex gap-2">
                             <div className="w-1 h-1 rounded-full bg-primary-500 animate-pulse" />
                             <div className="w-1 h-1 rounded-full bg-dark-300" />
                             <div className="w-1 h-1 rounded-full bg-dark-300" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
