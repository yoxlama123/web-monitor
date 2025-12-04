/**
 * Text manipulation utilities
 */

/**
 * Truncate text to a maximum length with smart word breaking
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text with ellipsis
 */
export const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;

    let truncated = text.substring(0, maxLength);

    // Remove trailing punctuation and spaces
    truncated = truncated.replace(/[\s\.,;:!?]*$/, '');

    // Find last space to avoid cutting words
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 10) {
        truncated = truncated.substring(0, lastSpace);
    }

    // Remove trailing punctuation again
    truncated = truncated.replace(/[\.,;:!?]+$/, '');

    return truncated + '...';
};
