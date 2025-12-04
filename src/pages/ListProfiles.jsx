import React, { useState } from 'react';
import { Instagram, Edit2, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useModalState } from '../hooks/useModalState';
import { useWebhook } from '../hooks/useWebhook';
import { useFetch } from '../hooks/useFetch';
import { api } from '../services/api';
import { buildProfileUrl } from '../utils/url';
import { extractProfileName } from '../utils/url';
import { formatDate } from '../utils/date';
import { ANIMATION_DELAYS } from '../constants';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorDisplay from '../components/common/ErrorDisplay';

const ListProfiles = () => {
    const { darkMode, setDarkMode, filter, setFilter } = useApp();
    const modal = useModalState();
    const webhook = useWebhook();
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, profile: null });

    // Fetch profiles
    const { data: profiles, loading, error, refetch } = useFetch(() => api.listProfiles());

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

            // Close modal and refresh list after success
            setTimeout(() => {
                modal.closeModal();
                webhook.reset();
                refetch();
            }, ANIMATION_DELAYS.SUCCESS_MESSAGE);

        } catch (err) {
            // Error is already handled by webhook hook
        }
    };

    // Handle profile deletion
    const handleDeleteProfile = async (profile) => {
        try {
            await webhook.sendCommand('removeurl', {
                url: profile.profile_url,
                platform: profile.platform
            });

            setDeleteConfirm({ isOpen: false, profile: null });
            refetch();
        } catch (err) {
            alert('Bir hata oluştu: ' + err.message);
            setDeleteConfirm({ isOpen: false, profile: null });
        }
    };

    // Calculate counts
    const counts = {
        all: profiles?.length || 0,
        instagram: profiles?.filter(p => {
            const platform = (p.platform || '').toLowerCase();
            return platform === 'instagram';
        }).length || 0,
        x: profiles?.filter(p => {
            const platform = (p.platform || '').toLowerCase();
            return platform === 'x' || platform === 'twitter';
        }).length || 0
    };

    // Filter profiles
    const filteredProfiles = profiles?.filter(profile => {
        if (filter === 'all') return true;
        const platform = (profile.platform || '').toLowerCase();
        if (filter === 'Instagram') return platform === 'instagram';
        if (filter === 'X') return platform === 'x' || platform === 'twitter';
        return true;
    }) || [];

    const XIcon = ({ className }) => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );

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
                currentPage="list"
            >
                <div className="max-w-4xl mx-auto">
                    <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-black'}`}>
                        Profil Listesi
                    </h2>

                    {loading ? (
                        <LoadingSpinner darkMode={darkMode} />
                    ) : error ? (
                        <ErrorDisplay darkMode={darkMode} error={error} onRetry={refetch} />
                    ) : filteredProfiles.length === 0 ? (
                        <div className="flex items-center justify-center h-96">
                            <div className={darkMode ? 'text-[#94A3B8] text-lg' : 'text-gray-500 text-lg'}>
                                Bu kategoride profil bulunamadı
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredProfiles.map((profile, index) => {
                                const profileName = extractProfileName(profile.profile_url);
                                const platform = (profile.platform || '').toLowerCase();

                                return (
                                    <div
                                        key={profile.id || index}
                                        className={`rounded-2xl shadow-lg overflow-hidden transition-all duration-200 ${darkMode ? 'bg-[#1E293B] hover:bg-[#334155]' : 'bg-white hover:bg-gray-50'}`}
                                    >
                                        <div className="p-5">
                                            <div className="flex items-center gap-4">
                                                {/* Profile Image */}
                                                <a
                                                    href={profile.profile_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-shrink-0"
                                                >
                                                    <img
                                                        src={profile.profile_image || '/default-avatar.png'}
                                                        alt={profileName}
                                                        className="w-16 h-16 rounded-full object-cover hover:opacity-80 transition-opacity cursor-pointer border-2 border-gray-300"
                                                        onError={(e) => {
                                                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect width="64" height="64" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="24" fill="%23999"%3E?%3C/text%3E%3C/svg%3E';
                                                        }}
                                                    />
                                                </a>

                                                {/* Profile Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <a
                                                            href={profile.profile_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`font-bold text-lg hover:underline ${darkMode ? 'text-[#E2E8F0]' : 'text-black'}`}
                                                        >
                                                            {profileName}
                                                        </a>
                                                        <div className={darkMode ? 'text-[#E2E8F0]' : 'text-gray-800'}>
                                                            {platform === 'instagram' ? (
                                                                <Instagram className="w-5 h-5" />
                                                            ) : (
                                                                <XIcon className="w-5 h-5" />
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                        <div>
                                                            <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                Kategori:
                                                            </span>{' '}
                                                            <span className={darkMode ? 'text-gray-300' : 'text-gray-900'}>
                                                                {profile.category || '-'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                Eklenme:
                                                            </span>{' '}
                                                            <span className={darkMode ? 'text-gray-300' : 'text-gray-900'}>
                                                                {formatDate(profile.createdAt)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                RSS Feed:
                                                            </span>{' '}
                                                            <a
                                                                href={profile.rss_feed}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={`hover:underline ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}
                                                            >
                                                                Link
                                                            </a>
                                                        </div>
                                                        <div>
                                                            <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                Son Kontrol:
                                                            </span>{' '}
                                                            <span className={darkMode ? 'text-gray-300' : 'text-gray-900'}>
                                                                {formatDate(profile.last_check)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-2 ml-4">
                                                    <button
                                                        disabled
                                                        className={`p-2 rounded-lg transition-all ${darkMode ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                                        title="Yakında eklenecek"
                                                    >
                                                        <Edit2 className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm({ isOpen: true, profile })}
                                                        className={`p-2 rounded-lg transition-all ${darkMode ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                                        title="Sil"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
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

            {/* Delete Confirmation Modal */}
            {deleteConfirm.isOpen && deleteConfirm.profile && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={() => setDeleteConfirm({ isOpen: false, profile: null })}
                >
                    <div
                        className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${darkMode ? 'bg-[#1E293B] border border-[#334155]' : 'bg-white'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>
                            Profil Silme Onayı
                        </h3>
                        <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <span className={`font-bold px-2 py-1 rounded ${darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                                {deleteConfirm.profile.platform}
                            </span>{' '}
                            platformundaki{' '}
                            <span className={`font-bold px-2 py-1 rounded ${darkMode ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                                {extractProfileName(deleteConfirm.profile.profile_url)}
                            </span>{' '}
                            profilini silmek istediğinizden emin misiniz?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleDeleteProfile(deleteConfirm.profile)}
                                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Evet, Sil
                            </button>
                            <button
                                onClick={() => setDeleteConfirm({ isOpen: false, profile: null })}
                                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'}`}
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ListProfiles;
