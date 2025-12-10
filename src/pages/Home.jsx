import React from 'react';
import { useApp } from '../context/AppContext';
import { useModalState } from '../hooks/useModalState';
import { useWebhook } from '../hooks/useWebhook';
import { useFetch } from '../hooks/useFetch';
import { api } from '../services/api';
import { buildProfileUrl } from '../utils/url';
import { INTERVALS, ANIMATION_DELAYS } from '../constants';
import Layout from '../components/Layout';
import PostCard from '../components/PostCard';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorDisplay from '../components/common/ErrorDisplay';

const Home = () => {
    const { darkMode, setDarkMode, filter, setFilter } = useApp();
    const modal = useModalState();
    const webhook = useWebhook();
    const [posts, setPosts] = React.useState([]);
    const [page, setPage] = React.useState(1);
    const [hasMore, setHasMore] = React.useState(true);
    const [loading, setLoading] = React.useState(true);
    const [loadingMore, setLoadingMore] = React.useState(false);
    const [error, setError] = React.useState(null);
    const observerTarget = React.useRef(null);
    const PAGE_SIZE = 10;

    // Fetch posts function
    const loadPosts = React.useCallback(async (pageNum, isInitial = false) => {
        try {
            if (isInitial) setLoading(true);
            else setLoadingMore(true);

            console.log(`Loading posts: Page ${pageNum}`);
            const newPosts = await api.getPosts(pageNum, PAGE_SIZE);

            if (newPosts.length < PAGE_SIZE) {
                setHasMore(false);
            }

            setPosts(prev => isInitial ? newPosts : [...prev, ...newPosts]);
            setError(null);
        } catch (err) {
            console.error('Error loading posts:', err);
            setError(err.message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    // Initial load
    React.useEffect(() => {
        loadPosts(1, true);
    }, [loadPosts]);

    // Infinite scroll observer
    React.useEffect(() => {
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
                rootMargin: '2500px' // Start loading 2500px before reaching the bottom
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

    // Handle command submission
    const handleCommand = async () => {
        if (!modal.formData.url) {
            return;
        }

        try {
            const profileUrl = buildProfileUrl(modal.formData.url, modal.formData.platform);
            const action = modal.type === 'add' ? 'addurl' : 'removeurl';

            if (action === 'addurl') {
                await webhook.sendCommand(action, {
                    url: profileUrl,
                    category: modal.formData.category || null,
                    platform: modal.formData.platform
                });
            } else {
                await webhook.sendCommand(action, {
                    url: profileUrl,
                    platform: modal.formData.platform
                });
            }

            // Close modal after success
            setTimeout(() => {
                modal.closeModal();
                webhook.reset();
                // Refresh list after add/remove
                refetch();
            }, ANIMATION_DELAYS.SUCCESS_MESSAGE);

        } catch (err) {
            // Error is already handled by webhook hook
        }
    };

    // Calculate counts
    const counts = {
        all: posts?.length || 0,
        instagram: posts?.filter(p => p.platform === 'instagram').length || 0,
        x: posts?.filter(p => p.platform !== 'instagram').length || 0
    };

    // Filter posts
    const filteredPosts = posts?.filter(post => {
        if (filter === 'all') return true;
        if (filter === 'instagram') return post.platform === 'instagram';
        if (filter === 'x') return post.platform !== 'instagram';
        return true;
    }) || [];

    return (
        <>
            <Layout
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                filter={filter}
                setFilter={setFilter}
                counts={counts}
                onAddUrl={() => modal.openModal('add')}
                onRemoveUrl={() => modal.openModal('remove')}
                currentPage="home"
            >
                <div className="max-w-2xl mx-auto flex flex-col items-center pb-8">
                    {loading ? (
                        <LoadingSpinner darkMode={darkMode} />
                    ) : error ? (
                        <ErrorDisplay darkMode={darkMode} error={error} onRetry={refetch} />
                    ) : filteredPosts.length === 0 ? (
                        <div className="flex items-center justify-center h-96">
                            <div className={darkMode ? 'text-[#94A3B8] text-lg' : 'text-gray-500 text-lg'}>
                                Bu kategoride gönderi bulunamadı
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 w-full flex flex-col items-center">
                            {filteredPosts.map((post, index) => (
                                <PostCard key={`${post.id || index}-${index}`} post={post} index={index} darkMode={darkMode} />
                            ))}

                            {/* Loading Sentinel */}
                            {hasMore && (
                                <div ref={observerTarget} className="flex justify-center w-full min-h-[1px]">
                                    {loadingMore && (
                                        <div className="p-4">
                                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {!hasMore && posts.length > 0 && (
                                <div className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'} py-4`}>
                                    Tüm gönderiler yüklendi
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Layout>

            <Modal
                isOpen={modal.isOpen}
                onClose={modal.closeModal}
                type={modal.type}
                darkMode={darkMode}
                formData={modal.formData}
                onFormChange={modal.updateField}
                isPlatformDropdownOpen={modal.isPlatformDropdownOpen}
                onPlatformToggle={modal.togglePlatformDropdown}
                onPlatformSelect={modal.selectPlatform}
                status={{
                    loading: webhook.loading,
                    message: webhook.error || webhook.success,
                    type: webhook.error ? 'error' : 'success'
                }}
                onSubmit={handleCommand}
            />
        </>
    );
};

export default Home;
