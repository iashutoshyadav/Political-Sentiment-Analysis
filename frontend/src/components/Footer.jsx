export default function Footer() {
    return (
        <footer className="border-t border-slate-800 mt-16 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-sm">🗞</div>
                        <span className="text-sm font-semibold text-slate-300">PolitiSense</span>
                    </div>
                    <p className="text-xs text-slate-600 text-center">
                        Political News Sentiment Analysis System • Powered by VADER & TextBlob NLP
                    </p>
                    <p className="text-xs text-slate-700">© 2026 All rights reserved</p>
                </div>
            </div>
        </footer>
    );
}
