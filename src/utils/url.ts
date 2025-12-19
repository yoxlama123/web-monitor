/**
 * URL manipulation utilities
 */

/**
 * Extract profile name from URL
 * @param {string} url - Profile URL
 * @returns {string} Profile name or 'Unknown'
 */
export const extractProfileName = (url: string | undefined): string => {
    if (!url) return 'Unknown';

    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(part => part);
        return pathParts[pathParts.length - 1] || 'Unknown';
    } catch {
        return 'Unknown';
    }
};

/**
 * Build profile URL from username and platform
 * @param {string} username - Username (with or without @)
 * @param {string} platform - Platform name ('Instagram' or 'X')
 * @returns {string} Full profile URL
 */
export const buildProfileUrl = (username: string, platform: string): string => {
    if (!username) return '';
    const cleanUsername = username.replace('@', '').trim();
    const p = platform.toLowerCase();

    if (p === 'instagram') {
        return `https://www.instagram.com/${cleanUsername.toLowerCase()}/`;
    } else if (p === 'x' || p === 'twitter') {
        return `https://x.com/${cleanUsername}/`;
    } else if (p === 'tiktok') {
        return `https://www.tiktok.com/@${cleanUsername}/`;
    } else if (p === 'onlyfans') {
        return `https://onlyfans.com/${cleanUsername}/`;
    } else if (p === 'fansly') {
        return `https://fansly.com/${cleanUsername}/`;
    }

    return cleanUsername; // Fallback to username if platform unknown
};
/**
 * Sanitize entering username/URL to plain username
 * @param {string} text - Input text
 * @returns {string} Cleaned username
 */
export const sanitizeUsername = (text: string | undefined): string => {
    if (!text) return '';

    try {
        // Handle cases that look like URLs
        if (text.includes('://') || text.includes('www.')) {
            const urlString = text.startsWith('http') ? text : `https://${text}`;
            const urlObj = new URL(urlString);
            const pathParts = urlObj.pathname.split('/').filter(part => part);
            let username = pathParts[pathParts.length - 1] || '';
            // Handle @ in path (common for some platforms redirecting)
            return username.startsWith('@') ? username.substring(1) : username;
        }
    } catch (e) {
        // Fallback to manual string parsing if URL parsing fails
    }

    let cleanText = text.trim();
    // Remove leading @
    if (cleanText.startsWith('@')) cleanText = cleanText.substring(1);

    // If it contains slashes but wasn't caught by URL parser
    if (cleanText.includes('/')) {
        const parts = cleanText.split('/').filter(p => p);
        cleanText = parts[parts.length - 1] || '';
    }

    // Final check for @ in manual parsing result
    if (cleanText.startsWith('@')) cleanText = cleanText.substring(1);

    return cleanText;
};
