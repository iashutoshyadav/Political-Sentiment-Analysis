import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, BarChart3, Search, ShieldCheck, Globe } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
        className="group relative p-8 border-l border-chalk-200/50 hover:border-primary-500 transition-colors duration-500 bg-white/30 backdrop-blur-sm"
    >
        <div className="absolute top-3 right-4 text-[7px] font-mono text-chalk-200 group-hover:text-primary-300 transition-colors">FEAT-CORE-0{Math.floor(delay * 10)}</div>
        <div className="w-10 h-10 mb-6 text-dark-900 group-hover:text-primary-600 group-hover:scale-110 transition-all duration-500">
            <Icon size={32} strokeWidth={1} />
        </div>
        <h3 className="text-3xl font-serif italic text-dark-950 mb-6 group-hover:text-primary-700 transition-colors">{title}</h3>
        <p className="text-dark-500 text-sm leading-relaxed font-light font-serif italic">{description}</p>
    </motion.div>
);

const ModelCard = ({ name, type, description, specs, id }) => (
    <div className="bg-white/40 backdrop-blur-xl p-8 border border-chalk-200/50 group hover:border-primary-500/50 transition-all duration-700 relative overflow-hidden">
        <div className="absolute -top-4 -right-4 text-[40px] font-serif italic text-chalk-100 select-none pointer-events-none group-hover:text-primary-50 opacity-50 transition-colors">{id}</div>
        <div className="flex items-center justify-between mb-10 relative z-10">
            <div className="space-y-1">
                <h3 className="text-2xl font-serif italic text-dark-950">{name}</h3>
                <p className="text-[8px] font-mono text-chalk-400 uppercase tracking-[0.3em]">UNIT SERIAL: PS-MOD-{id}</p>
            </div>
            <span className="text-[8px] font-black text-primary-600 uppercase tracking-widest px-4 py-1.5 border border-primary-100 bg-primary-50/30">
                {type}
            </span>
        </div>
        <p className="text-dark-600 text-sm mb-10 leading-relaxed font-light font-serif italic relative z-10">{description}</p>
        <div className="grid grid-cols-1 gap-4 relative z-10">
            {specs.map((spec, i) => (
                <div key={i} className="flex items-center gap-4 text-[9px] text-dark-400 font-mono tracking-wider">
                    <div className="w-1.5 h-1.5 rounded-full border border-primary-500 group-hover:bg-primary-500 transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0)] group-hover:shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                    {spec}
                </div>
            ))}
        </div>
    </div>
);

export default function Home({ onOpenAuth }) {
    return (
        <div className="relative selection:bg-amber-100 selection:text-amber-900 noise-overlay min-h-screen bg-[#fff7ed] blueprint-grid overflow-x-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/10 to-transparent pointer-events-none" />
            
            {/* Cinematic Noise Layer (Animated) */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] mix-blend-overlay">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
            </div>

            {/* Architectural Guide Lines & Degree Markers */}
            <div className="absolute top-0 left-[20%] w-px h-full bg-chalk-200/30 pointer-events-none" />
            <div className="absolute top-0 right-[20%] w-px h-full bg-chalk-200/30 pointer-events-none" />
            <div className="absolute top-32 left-[20%] -translate-x-1/2 text-[6px] font-mono text-chalk-300 uppercase tracking-widest bg-[#fff7ed] px-1">0° DEG / VER</div>
            <div className="absolute top-32 right-[20%] translate-x-1/2 text-[6px] font-mono text-chalk-300 uppercase tracking-widest bg-[#fff7ed] px-1">90° DEG / HOR</div>

            {/* Hero Section - Cinematic Layout */}
            <section className="min-h-[80vh] flex items-center pt-16 pb-20 px-6 lg:px-12 relative overflow-hidden border-b border-chalk-200/50">
                {/* Visual Anchors (Coordinates) */}
                <div className="absolute top-32 left-8 text-[8px] font-mono text-dark-300 uppercase tracking-widest vertical-rl">48.2082° N, 16.3738° E</div>
                <div className="absolute top-32 right-8 text-[8px] font-mono text-dark-300 uppercase tracking-widest vertical-rl">ARCH / LOGIC: V12.8</div>

                <div className="w-full max-w-[1400px] mx-auto grid lg:grid-cols-[1fr_400px] gap-24 items-center relative z-20">
                    <div className="text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <h1 className="text-[12vw] lg:text-[11rem] editorial-heading text-dark-950 mb-12 tracking-tighter leading-[0.8] mix-blend-multiply">
                                Deep <br />
                                <span className="text-primary-600">Political</span> <br />
                                <span className="opacity-20">Architect.</span>
                            </h1>
                        </motion.div>

                        <div className="flex flex-col md:flex-row items-start gap-12 mt-16">
                            <motion.p
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="text-dark-600 text-xl max-w-sm leading-relaxed font-light font-serif italic"
                            >
                                Deciphering the hidden geometry of political narratives through a high-fidelity ensemble intelligence.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                                className="flex flex-col gap-6"
                            >
                                <button
                                    onClick={() => onOpenAuth('signup')}
                                    className="bg-dark-950 text-white px-12 py-5 transition-all font-serif italic text-xl hover:bg-dark-800 relative group overflow-hidden"
                                >
                                    Initialise Analysis
                                    <div className="absolute inset-x-0 h-[100%] top-0 bg-gradient-to-b from-primary-500/20 to-transparent -translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out" />
                                    <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                                </button>
                                <button 
                                    onClick={() => onOpenAuth('signup')}
                                    className="text-sm font-black text-dark-950 uppercase tracking-[0.3em] border-b border-dark-950 pb-1 self-start hover:text-primary-600 hover:border-primary-600 transition-colors"
                                >
                                    Browse Protocols
                                </button>
                            </motion.div>
                        </div>
                    </div>

                    {/* Floating Live Data Layer */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="hidden lg:block relative"
                    >
                        <div className="glass-luxury p-8 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-primary-500/20 shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                            <div className="flex items-center justify-between mb-8">
                                <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest italic animate-pulse">Neural Pulse Live</span>
                                <Cpu size={16} className="text-dark-300" />
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <p className="text-[8px] font-mono text-dark-400 uppercase tracking-widest">Active Stream / Source: EN-01</p>
                                    <div className="h-12 w-full bg-chalk-50/50 border border-chalk-100 flex items-end gap-1 p-1 overflow-hidden">
                                        {[40, 70, 45, 90, 65, 30, 85, 50, 60, 40, 75, 55].map((h, i) => (
                                            <motion.div
                                                key={i}
                                                animate={{ height: [`${h}%`, `${h + 10}%`, `${h}%`] }}
                                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                                                className="flex-1 bg-primary-500/30"
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-chalk-100 flex justify-between items-end">
                                    <div className="relative">
                                        <p className="text-[7px] font-mono text-primary-600 uppercase tracking-widest mb-2 font-black">VALIDATION-SCORE</p>
                                        <p className="text-4xl font-serif italic text-dark-950 leading-none">95.5<span className="text-lg text-primary-500">%</span></p>
                                        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500/10" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[7px] font-mono text-dark-400 uppercase tracking-widest mb-1">Index Delta</p>
                                        <p className="text-xl font-mono text-green-600 font-bold tracking-tighter">+0.82</p>
                                    </div>
                                </div>
                            </div>

                            {/* Watermark */}
                            <div className="absolute bottom-4 right-4 text-[6px] font-mono text-chalk-200 rotate-90 origin-right">
                                PS-INTEL-PROTOCOL-X84
                            </div>
                        </div>

                        {/* Decorative Coordinate */}
                        <div className="absolute -bottom-8 -right-8 text-neutral-200 text-6xl font-serif italic select-none pointer-events-none opacity-40">
                            01
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="py-16 border-y border-chalk-200 bg-white relative z-20">
                <div className="w-full px-6 lg:px-12 grid grid-cols-2 md:grid-cols-4 gap-12">
                    {[
                        { label: 'Protocols Active', value: '03', serial: 'PR-82' },
                        { label: 'F1 Reliability', value: '95.5%', serial: 'RL-95' },
                        { label: 'Mean Latency', value: '200ms', serial: 'LT-20' },
                        { label: 'Global Scope', value: 'INTEL', serial: 'SC-GL' },
                    ].map((stat, i) => (
                        <div key={i} className="border-l border-chalk-200/50 pl-8 relative group py-2">
                            <div className="absolute -left-1 top-0 w-2 h-2 rounded-full border border-primary-500 group-hover:bg-primary-500 transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0)] group-hover:shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                            <div className="text-[7px] font-mono text-chalk-400 mb-1">{stat.serial}</div>
                            <div className="text-5xl font-serif italic text-dark-950 mb-2 group-hover:text-primary-600 transition-colors duration-500">{stat.value}</div>
                            <div className="text-primary-600 text-[8px] font-black uppercase tracking-[0.4em]">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Grid - Editorial Layout */}
            <section className="py-24 px-6 lg:px-12 bg-white border-y border-chalk-200">
                <div className="w-full">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                        <div className="max-w-xl">
                            <h2 className="text-5xl font-serif italic text-dark-950 mb-4">Foundations of Insight.</h2>
                            <p className="text-dark-500 text-lg font-light leading-relaxed">Our infrastructure is built for depth, scale, and uncompromising accuracy in the political domain.</p>
                        </div>
                        <div className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mb-2">Capabilities / 001</div>
                    </div>
                    <div className="grid md:grid-cols-3">
                        <FeatureCard
                            icon={Search}
                            title="Keyword Discovery"
                            description="Automatically detects political entities, parties, and trending topics across thousands of articles."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={BarChart3}
                            title="Sentiment Indexing"
                            description="Our proprietary scoring system combines three models to provide the most accurate sentiment index."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={ShieldCheck}
                            title="Bias Detection"
                            description="Identify subtle media biases and narrative shifts with our advanced context-aware algorithms."
                            delay={0.3}
                        />
                    </div>
                </div>
            </section>

            {/* The Models (Technical Section) - Dossier Style */}
            <section className="py-24 px-6 lg:px-12 relative">
                <div className="w-full">
                    <div className="grid lg:grid-cols-2 gap-24 items-start">
                        <div className="sticky top-32">
                            <div className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mb-12">Intelligence / Ensemble</div>
                            <h2 className="text-7xl font-serif italic text-dark-950 mb-12 leading-[0.9]">
                                High Fidelity <br />
                                <span className="text-primary-600">Decision</span> Logic.
                            </h2>
                            <p className="text-dark-600 mb-12 leading-relaxed text-xl font-light font-serif italic opacity-80">
                                "The complexity of political narrative requires more than just a single neural network. It requires an ensemble of specialized linguistic observers."
                            </p>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                                        <span className="text-primary-700 font-bold">1</span>
                                    </div>
                                    <div>
                                        <h4 className="text-dark-950 font-bold mb-1">Deep Learning Core</h4>
                                        <p className="text-dark-600 text-sm">BiLSTM-Attention model delivering 95.5% F1 accuracy.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                                        <span className="text-primary-700 font-bold">2</span>
                                    </div>
                                    <div>
                                        <h4 className="text-dark-950 font-bold mb-1">Ensemble Fallback</h4>
                                        <p className="text-dark-600 text-sm">VADER & TextBlob ensure coverage across diverse news styles.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <ModelCard
                                name="BiLSTM-Attention"
                                type="Deep Learning"
                                description="Bidirectional LSTM with custom attention layers for capturing long-range political context."
                                specs={['95.5% F1 Accuracy', '1.2M Parameters', 'Context Aware']}
                            />
                            <ModelCard
                                name="VADER"
                                type="Lexicon-based"
                                description="Highly sensitive to news-style punctuation and emotional intensity."
                                specs={['Headline Tuned', 'Negation Handling', 'Fast Processing']}
                            />
                            <ModelCard
                                name="TextBlob"
                                type="Linguistic"
                                description="Provides a baseline for polarity and subjectivity based on massive corpora."
                                specs={['Subjectivity Index', 'Word Net Access', 'Pattern Based']}
                            />
                            <div className="bg-orange-600 flex flex-col items-center justify-center text-center p-8 rounded-2xl shadow-lg border border-orange-500">
                                <Globe className="text-white mb-3" size={40} />
                                <div className="text-white font-bold text-lg">Indian Context</div>
                                <p className="text-orange-100/90 text-[11px] font-medium px-4">Tuned for regional entities and socio-political nuances</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section - Minimalist Editorial */}
            <section className="py-32 px-6 lg:px-12 bg-white text-center border-t border-chalk-200">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-7xl md:text-9xl font-serif italic text-dark-950 mb-12 tracking-tight">
                            Access the <br />
                            <span className="text-primary-600">Intelligence.</span>
                        </h2>
                        <p className="text-dark-500 mb-16 text-xl md:text-2xl font-light font-serif italic max-w-2xl mx-auto opacity-70">
                            Join an elite circle of analysts decoding the modern political narrative through high-fidelity sentiment data.
                        </p>
                        <button
                            onClick={() => onOpenAuth('signup')}
                            className="bg-dark-950 text-white px-16 py-6 transition-all font-serif italic text-2xl hover:bg-dark-800 hover:px-20 active:translate-y-1"
                        >
                            Begin Protocol
                        </button>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
