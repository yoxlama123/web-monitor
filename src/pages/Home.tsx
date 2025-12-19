import React from 'react';
import { useApp } from '../context/AppContext';
import { useModalState } from '../hooks/useModalState';
import { usePostManager } from '../hooks/usePostManager';
import Layout from '../components/Layout';
import PostCard from '../components/PostCard';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorDisplay from '../components/common/ErrorDisplay';

const Home: React.FC = () => {
    const { darkMode, setDarkMode, filter, setFilter } = useApp();
    const modal = useModalState();
    const {
        posts,
        loading,
        loadingMore,
        error,
        hasMore,
        observerTarget,
        refetch,
        handleCommand,
        webhook
    } = usePostManager(10);

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
                    message: webhook.error || (webhook as any).success,
                    type: webhook.error ? 'error' : 'success'
                }}
                onSubmit={() => handleCommand(modal)}
                connectionDropdownOpen={modal.connectionDropdownOpen}
                addConnection={modal.addConnection}
                removeConnection={modal.removeConnection}
                updateConnection={modal.updateConnection}
                toggleConnectionDropdown={modal.toggleConnectionDropdown}
                selectConnectionPlatform={modal.selectConnectionPlatform}
            />
        </>
    );
};

export default Home;
