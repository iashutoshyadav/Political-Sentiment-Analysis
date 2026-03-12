export default function LoadingSpinner({ text = 'Analyzing...', size = 'md' }) {
    const sz = { sm: 'w-6 h-6', md: 'w-12 h-12', lg: 'w-16 h-16' }[size];
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className={`${sz} rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin`} />
            {text && <p className="text-slate-400 text-sm animate-pulse">{text}</p>}
        </div>
    );
}
