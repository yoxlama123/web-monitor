export interface Post {
    id: string;
    platform: string;
    profile_url: string;
    profile_image?: string;
    content?: string;
    timestamp: string;
    media?: string[];
    // Add other fields based on API response
}
