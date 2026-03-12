export function formatDate(dateStr) {
    if (!dateStr) return 'Unknown date';
    try {
        return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return dateStr; }
}

export function truncate(str, n = 120) {
    if (!str) return '';
    return str.length > n ? str.slice(0, n) + '...' : str;
}

export function getSentimentEmoji(label) {
    return { Positive: '🟢', Neutral: '🟡', Negative: '🔴' }[label] || '⚪';
}

export function calcPercentage(count, total) {
    if (!total) return 0;
    return Math.round((count / total) * 100);
}

export function scoreToPercent(score) {
    return Math.round((score + 1) / 2 * 100);
}
