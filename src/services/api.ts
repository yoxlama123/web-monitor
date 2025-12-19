/**
 * API Service for centralized data fetching
 */
class ApiService {
    baseUrl: string | undefined;
    commandUrl: string | undefined;

    constructor() {
        this.baseUrl = import.meta.env.VITE_WEBHOOK_URL;
        this.commandUrl = import.meta.env.VITE_COMMAND_WEBHOOK_URL || this.baseUrl;
    }

    /**
     * Generic request handler
     */
    async request(url: string, options: RequestInit = {}): Promise<any> {
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
     */
    async getPosts(page: number = 1, pageSize: number | 'all' = 10): Promise<any[]> {
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
        let posts: any[] = [];
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
     */
    async addUrl(url: string, category: string | null, platform: string): Promise<any> {
        if (!this.commandUrl) return;
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
     */
    async removeUrl(url: string, platform: string): Promise<any> {
        if (!this.commandUrl) return;
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
     */
    async listProfiles(options: any = {}): Promise<any[]> {
        if (!this.commandUrl) return [];
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
export default api;
