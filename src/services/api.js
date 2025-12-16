/**
 * API Service for centralized data fetching
 */
class ApiService {
    constructor() {
        this.baseUrl = import.meta.env.VITE_WEBHOOK_URL;
        this.commandUrl = import.meta.env.VITE_COMMAND_WEBHOOK_URL || this.baseUrl;
    }

    /**
     * Generic request handler
     * @param {string} url - Request URL
     * @param {object} options - Fetch options
     * @returns {Promise<any>} Response data
     */
    async request(url, options = {}) {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get posts from webhook
     * @param {number} page - Page number (default: 1)
     * @param {number} pageSize - Page size (default: 10)
     * @returns {Promise<Array>} Posts array
     */
    async getPosts(page = 1, pageSize = 10) {
        if (!this.baseUrl) {
            throw new Error('Webhook URL tanımlanmamış. Lütfen .env dosyasını kontrol edin.');
        }

        console.log(`Fetching posts: Page ${page}, Size ${pageSize}`);

        const data = await this.request(this.baseUrl, {
            method: 'POST',
            body: JSON.stringify({
                page,
                pageSize
            })
        });

        // Normalize response to array
        let posts = [];
        if (Array.isArray(data)) {
            posts = data;
        } else if (data && typeof data === 'object') {
            if (Array.isArray(data.data)) {
                posts = data.data;
            } else {
                posts = [data];
            }
        }

        return posts;
    }

    /**
     * Add URL to monitoring
     * @param {string} url - Profile URL
     * @param {string} category - Category (optional)
     * @param {string} platform - Platform name
     * @returns {Promise<object>} Response data
     */
    async addUrl(url, category, platform) {
        return this.request(this.commandUrl, {
            method: 'POST',
            body: JSON.stringify({
                action: 'addurl',
                profile_url: url,
                category: category || null,
                platform
            })
        });
    }

    /**
     * Remove URL from monitoring
     * @param {string} url - Profile URL
     * @param {string} platform - Platform name
     * @returns {Promise<object>} Response data
     */
    async removeUrl(url, platform) {
        return this.request(this.commandUrl, {
            method: 'POST',
            body: JSON.stringify({
                action: 'removeurl',
                profile_url: url,
                platform
            })
        });
    }

    /**
     * List all monitored profiles
     * @returns {Promise<Array>} Profiles array
     */
    async listProfiles(options = {}) {
        const payload = {
            action: 'listurl',
            ...options
        };

        const data = await this.request(this.commandUrl, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        // Normalize response to array
        if (Array.isArray(data)) {
            return data;
        } else if (data && data.profiles && Array.isArray(data.profiles)) {
            return data.profiles;
        } else if (data && typeof data === 'object') {
            return [data];
        }

        return [];
    }
}

// Export singleton instance
export const api = new ApiService();
