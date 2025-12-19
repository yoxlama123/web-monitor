import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { Post } from '../types/post';
import { useWebhook } from './useWebhook';
import { buildProfileUrl } from '../utils/url';
import { ANIMATION_DELAYS } from '@/constants';

export const usePostManager = (pageSize: number = 10) => {
    const webhook = useWebhook();
    const [posts, setPosts] = useState<Post[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const observerTarget = useRef<HTMLDivElement | null>(null);

    const loadPosts = useCallback(async (pageNum: number, isInitial: boolean = false) => {
        try {
            if (isInitial) setLoading(true);
            else setLoadingMore(true);

            console.log(`Loading posts: Page ${pageNum}`);
            const newPosts = await api.getPosts(pageNum, pageSize);

            if (newPosts.length < pageSize) {
                setHasMore(false);
            }

            setPosts(prev => isInitial ? newPosts : [...prev, ...newPosts]);
            setError(null);
        } catch (err: any) {
            console.error('Error loading posts:', err);
            setError(err.message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [pageSize]);

    useEffect(() => {
        loadPosts(1, true);
    }, [loadPosts]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
                    setPage(prev => {
                        const nextPage = prev + 1;
                        loadPosts(nextPage);
                        return nextPage;
                    });
                }
            },
            {
                threshold: 0.1,
                rootMargin: '2500px'
            }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasMore, loading, loadingMore, loadPosts]);

    const refetch = () => {
        setPage(1);
        setHasMore(true);
        loadPosts(1, true);
    };

    const handleCommand = async (modal: any) => {
        if (!modal.formData.url) return;

        try {
            const profileUrl = buildProfileUrl(modal.formData.url, modal.formData.platform);
            const action = modal.type === 'add' ? 'addurl' : 'removeurl';

            if (action === 'addurl') {
                await webhook.sendCommand(action, {
                    profile_url: profileUrl,
                    category: modal.formData.category || null,
                    platform: modal.formData.platform,
                    connections: modal.formData.connections
                });
            } else {
                await webhook.sendCommand(action, {
                    profile_url: profileUrl,
                    platform: modal.formData.platform
                });
            }

            setTimeout(() => {
                modal.closeModal();
                webhook.reset();
                refetch();
            }, ANIMATION_DELAYS.SUCCESS_MESSAGE);

        } catch (err) { }
    };

    return {
        posts,
        loading,
        loadingMore,
        error,
        hasMore,
        observerTarget,
        refetch,
        handleCommand,
        webhook
    };
};
