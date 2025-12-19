export interface Connection {
    platform: string;
    url: string;
}

export interface Profile {
    id: string;
    profile_url: string;
    profile_image?: string;
    platform: string;
    category?: string;
    createdAt: string;
    last_check: string;
    rss_feed: string;
    connections?: Connection[];
}

export interface Status {
    loading: boolean;
    message: string | null;
    type: 'success' | 'error' | null;
}

export interface ModalState<T> {
    isOpen: boolean;
    data: T | null;
}
