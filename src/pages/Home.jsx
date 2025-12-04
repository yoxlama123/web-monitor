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

    // Fetch posts with auto-refresh
    const { data: posts, loading, error, refetch } = useFetch(
        () => api.getPosts(),
        INTERVALS.FETCH_POSTS
    );

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
            }, ANIMATION_DELAYS.SUCCESS_MESSAGE);

        } catch (err) {
            // Error is already handled by webhook hook
        }
    };

    // Calculate counts
    const counts = {
        all: posts?.length || 0,
        instagram: posts?.filter(p => p.platform === 'Instagram').length || 0,
        x: posts?.filter(p => p.platform !== 'Instagram').length || 0
    };

    // Filter posts
    const filteredPosts = posts?.filter(post => {
        if (filter === 'all') return true;
        if (filter === 'Instagram') return post.platform === 'Instagram';
        if (filter === 'X') return post.platform !== 'Instagram';
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
                <div className="max-w-2xl mx-auto flex flex-col items-center">
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
                                <PostCard key={index} post={post} index={index} darkMode={darkMode} />
                            ))}
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
