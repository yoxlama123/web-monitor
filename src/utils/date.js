/**
 * Date formatting utilities
 */

/**
 * Format date string to Turkish locale
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date or 'N/A'
 */
export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
        const date = new Date(dateString);
        return date.toLocaleString('tr-TR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return 'N/A';
    }
};

/**
 * Format relative time (e.g., '1s ago', '1m ago', '1H ago')
 * @param {number|string} timestamp - Unix timestamp (ms) or date string
 * @returns {string} Formatted relative time
 */
export const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';

    const now = Date.now();
    // Ensure timestamp is treated as number if it's a numeric string
    const timeVal = !isNaN(timestamp) ? Number(timestamp) : timestamp;
    const date = new Date(timeVal).getTime();

    if (isNaN(date)) return 'N/A';

    const diff = now - date;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);

    if (seconds < 60) return `${Math.max(0, seconds)}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}H ago`;
    if (days < 7) return `${days}d ago`;
    return `${weeks}W ago`;
};
