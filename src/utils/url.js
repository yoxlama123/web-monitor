/**
 * URL manipulation utilities
 */

/**
 * Extract profile name from URL
 * @param {string} url - Profile URL
 * @returns {string} Profile name or 'Unknown'
 */
export const extractProfileName = (url) => {
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
export const buildProfileUrl = (username, platform) => {
    const cleanUsername = username.replace('@', '').trim().toLowerCase();

    if (platform === 'Instagram') {
        return `https://www.instagram.com/${cleanUsername}/`;
    } else if (platform === 'X') {
        return `https://x.com/${cleanUsername}/`;
    }

    return '';
};
