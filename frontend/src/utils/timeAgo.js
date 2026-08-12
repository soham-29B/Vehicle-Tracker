export function formatTimeAgo(timestamp, now = Date.now()) {
    if (!timestamp) return '—';
    const diffSec = Math.floor((now - new Date(timestamp).getTime()) / 1000);

    if (diffSec < 5) return 'just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    return `${Math.floor(diffMin / 60)}h ago`;
}