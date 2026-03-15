export default function Footer() {
    return (
        <footer className="border-t border-chalk-300 bg-chalk-100 noise-overlay blueprint-grid relative z-20 py-4">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-none bg-dark-950 flex items-center justify-center text-white font-serif italic text-lg">P</div>
                            <div>
                                <span className="text-base font-serif italic text-dark-950 block leading-none">PolitiSense</span>
                                <span className="text-[7px] font-black text-primary-600 uppercase tracking-[0.3em]">Intelligence Protocol</span>
                            </div>
                        </div>
                        <p className="text-dark-500 text-[10px] font-light max-w-sm leading-relaxed">
                            A high-fidelity ensemble engine designed for the deep architectural analysis of modern political narratives.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
                        <div className="space-y-2">
                            <h4 className="text-[8px] font-black text-dark-950 uppercase tracking-[0.4em]">Engine</h4>
                            <ul className="space-y-1 text-[9px] font-light text-dark-500">
                                <li className="hover:text-primary-600 cursor-pointer transition-colors font-mono tracking-tighter">EN-v12.0.4</li>
                                <li className="hover:text-primary-600 cursor-pointer transition-colors font-mono tracking-tighter">BILSTM-ATN</li>
                                <li className="hover:text-primary-600 cursor-pointer transition-colors font-mono tracking-tighter">LATENCY: 200MS</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-[8px] font-black text-dark-950 uppercase tracking-[0.4em]">Nodes</h4>
                            <ul className="space-y-1 text-[9px] font-light text-dark-500">
                                <li className="hover:text-primary-600 cursor-pointer transition-colors font-mono tracking-tighter">LOC-IN-DEL</li>
                                <li className="hover:text-primary-600 cursor-pointer transition-colors font-mono tracking-tighter">LOC-IN-MUM</li>
                                <li className="hover:text-primary-600 cursor-pointer transition-colors font-mono tracking-tighter">LOC-IN-BLR</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-chalk-200/50">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-1 w-1">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1 w-1 bg-green-500"></span>
                            </span>
                            <span className="text-[7px] font-black text-dark-400 uppercase tracking-widest">Ensemble Core Live</span>
                        </div>
                        <span className="text-chalk-300">/</span>
                        <p className="text-[7px] font-mono text-dark-300 uppercase tracking-widest">SEQ-ID: PS-2026-X84</p>
                    </div>

                    <p className="text-[8px] font-black text-dark-950 uppercase tracking-[0.2em]">
                        © 2026 PolitiSense &bull; High Integrity Political Intelligence
                    </p>
                </div>
            </div>

            {/* Coordinate Markers */}
            <span className="coord-label top-2 right-4">X: 48.2 / Y: 12.9</span>
            <span className="coord-label bottom-2 left-4">Z: 0.12 - ALFA</span>
        </footer>
    );
}
