import { TrendingUp, Minus, TrendingDown } from 'lucide-react';

export default function SentimentBadge({ label, score }) {
    const cls = {
        Positive: 'badge-positive',
        Neutral: 'badge-neutral',
        Negative: 'badge-negative',
    }[label] || 'badge-neutral';

    const Icon = { Positive: TrendingUp, Neutral: Minus, Negative: TrendingDown }[label] || Minus;

    return (
        <span className={cls}>
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
            {score !== undefined && (
                <span className="opacity-70 font-normal">({score > 0 ? '+' : ''}{score?.toFixed(2)})</span>
            )}
        </span>
    );
}
