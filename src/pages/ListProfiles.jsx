import React, { useState } from 'react';
import { Instagram, Edit2, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, Plus, Trash, ChevronDown } from 'lucide-react';
import { PLATFORMS } from '../constants';
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
import { PlatformIcon } from '../components/icons/PlatformIcons';

const ListProfiles = () => {
    const { darkMode, setDarkMode, filter, setFilter } = useApp();
    const modal = useModalState();
    const webhook = useWebhook();
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, profile: null });
    const [editProfile, setEditProfile] = useState({ isOpen: false, profile: null, newCategory: '', connections: [] });
    const [editConnectionDropdownOpen, setEditConnectionDropdownOpen] = useState(null);
    const [editStatus, setEditStatus] = useState({ loading: false, message: null, type: null });
    const [selectedProfiles, setSelectedProfiles] = useState([]);
    const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
    const [bulkEditModal, setBulkEditModal] = useState({ isOpen: false, newCategory: '' });
    const [bulkEditStatus, setBulkEditStatus] = useState({ loading: false, message: null, type: null });
    // List navigation state
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    // Fetch profiles
    const { data: profiles, loading, error, refetch } = useFetch(() => api.listProfiles({ page, pageSize }));

    // Calculate counts
    const counts = {
        all: profiles?.length || 0,
        instagram: profiles?.filter(p => {
            const platform = (p.platform || '').toLowerCase();
            return platform === 'instagram';
        })?.length || 0,
        x: profiles?.filter(p => {
            const platform = (p.platform || '').toLowerCase();
            return platform === 'x' || platform === 'twitter';
        })?.length || 0
    };

    // Filter profiles
    const filteredProfiles = profiles?.filter(profile => {
        if (filter === 'all') return true;
        const platform = (profile.platform || '').toLowerCase();
        if (filter === 'Instagram') return platform === 'instagram';
        if (filter === 'X') return platform === 'x' || platform === 'twitter';
        return true;
    }) || [];

    // Refetch when pagination changes
    React.useEffect(() => {
        refetch();
    }, [page, pageSize]);

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
                profile_url: profile.profile_url,
                platform: profile.platform
            });

            setDeleteConfirm({ isOpen: false, profile: null });
            refetch();
        } catch (err) {
            alert('Bir hata oluştu: ' + err.message);
            setDeleteConfirm({ isOpen: false, profile: null });
        }
    };

    // Handle profile edit
    const handleEditProfile = async () => {
        if (!editProfile.newCategory.trim()) {
            setEditStatus({ loading: false, message: 'Lütfen kategori girin.', type: 'error' });
            return;
        }

        setEditStatus({ loading: true, message: null, type: null });

        try {
            const webhookUrl = import.meta.env.VITE_COMMAND_WEBHOOK_URL || import.meta.env.VITE_WEBHOOK_URL;

            const payload = {
                action: 'editprofile',
                profile_url: editProfile.profile.profile_url,
                category: editProfile.newCategory.trim(),
                connections: editProfile.connections
            };

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const responseData = await response.json();

            if (response.ok) {
                setEditStatus({
                    loading: false,
                    message: responseData.message || 'Profil başarıyla güncellendi!',
                    type: 'success'
                });

                // Close modal and refresh after 2 seconds
                setTimeout(() => {
                    setEditProfile({ isOpen: false, profile: null, newCategory: '', connections: [] });
                    setEditConnectionDropdownOpen(null);
                    setEditStatus({ loading: false, message: null, type: null });
                    refetch();
                }, 2000);
            } else {
                throw new Error(responseData.message || 'İşlem başarısız oldu.');
            }
        } catch (err) {
            setEditStatus({ loading: false, message: 'Bir hata oluştu: ' + err.message, type: 'error' });
        }
    };

    // Connection handlers for Edit Modal
    const sanitizeUsername = (text) => {
        if (!text) return '';
        // If it's a URL, extract the last part of the path
        try {
            if (text.includes('://') || text.includes('www.')) {
                const url = text.startsWith('http') ? text : `https://${text}`;
                const urlObj = new URL(url);
                const pathParts = urlObj.pathname.split('/').filter(part => part);
                let username = pathParts[pathParts.length - 1] || '';
                // Remove @ if it's the first character
                return username.startsWith('@') ? username.substring(1) : username;
            }
        } catch (e) {
            // Not a valid URL, fallback to direct text processing
        }

        // Remove @ if it's the first character
        let cleanText = text.trim();
        if (cleanText.startsWith('@')) {
            cleanText = cleanText.substring(1);
        }

        // If there's still a slash (e.g. from a partial path), take the last part
        if (cleanText.includes('/')) {
            const parts = cleanText.split('/').filter(p => p);
            cleanText = parts[parts.length - 1] || '';
        }

        return cleanText;
    };

    const addEditConnection = () => {
        setEditProfile(prev => ({
            ...prev,
            connections: [...prev.connections, { platform: 'instagram', url: '' }]
        }));
    };

    const removeEditConnection = (index) => {
        setEditProfile(prev => ({
            ...prev,
            connections: prev.connections.filter((_, i) => i !== index)
        }));
    };

    const updateEditConnection = (index, field, value) => {
        const processedValue = field === 'url' ? sanitizeUsername(value) : value;
        setEditProfile(prev => ({
            ...prev,
            connections: prev.connections.map((conn, i) =>
                i === index ? { ...conn, [field]: processedValue } : conn
            )
        }));
    };

    const toggleEditConnectionDropdown = (index) => {
        setEditConnectionDropdownOpen(prev => prev === index ? null : index);
    };

    const selectEditConnectionPlatform = (index, platform) => {
        updateEditConnection(index, 'platform', platform);
        setEditConnectionDropdownOpen(null);
    };

    // Handle bulk delete
    const handleBulkDelete = async () => {
        try {
            const webhookUrl = import.meta.env.VITE_COMMAND_WEBHOOK_URL || import.meta.env.VITE_WEBHOOK_URL;
            const urlString = selectedProfiles.map(id => {
                const profile = profiles.find(p => p.id === id);
                return profile?.profile_url;
            }).filter(Boolean).join(',');

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'removeurl', profile_url: urlString })
            });

            const responseData = await response.json();
            if (response.ok) {
                setBulkDeleteConfirm(false);
                setSelectedProfiles([]);
                refetch();
            } else {
                throw new Error(responseData.message || 'Toplu silme işlemi başarısız oldu.');
            }
        } catch (err) {
            alert('Bir hata oluştu: ' + err.message);
            setBulkDeleteConfirm(false);
        }
    };

    // Handle bulk edit
    const handleBulkEdit = async () => {
        if (!bulkEditModal.newCategory.trim()) {
            setBulkEditStatus({ loading: false, message: 'Lütfen kategori girin.', type: 'error' });
            return;
        }

        setBulkEditStatus({ loading: true, message: null, type: null });

        try {
            const webhookUrl = import.meta.env.VITE_COMMAND_WEBHOOK_URL || import.meta.env.VITE_WEBHOOK_URL;
            const urlString = selectedProfiles.map(id => {
                const profile = profiles.find(p => p.id === id);
                return profile?.profile_url;
            }).filter(Boolean).join(',');

            const payload = {
                action: 'editprofile',
                profile_url: urlString,
                category: bulkEditModal.newCategory.trim()
            };

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const responseData = await response.json();
            if (response.ok) {
                setBulkEditStatus({
                    loading: false,
                    message: responseData.message || 'Kategoriler başarıyla güncellendi!',
                    type: 'success'
                });
                setTimeout(() => {
                    setBulkEditModal({ isOpen: false, newCategory: '' });
                    setBulkEditStatus({ loading: false, message: null, type: null });
                    setSelectedProfiles([]);
                    refetch();
                }, 2000);
            } else {
                throw new Error(responseData.message || 'İşlem başarısız oldu.');
            }
        } catch (err) {
            setBulkEditStatus({ loading: false, message: 'Bir hata oluştu: ' + err.message, type: 'error' });
        }
    };

    const toggleProfileSelection = (profileId) => {
        setSelectedProfiles(prev => prev.includes(profileId) ? prev.filter(id => id !== profileId) : [...prev, profileId]);
    };

    const toggleSelectAll = () => {
        setSelectedProfiles(selectedProfiles.length === (filteredProfiles?.length || 0) ? [] : filteredProfiles.map(p => p.id));
    };

    const getCategoryBadgeColor = (category) => {
        if (!category || category === '-') return darkMode
            ? 'bg-gray-800 text-gray-400 border-gray-700'
            : 'bg-gray-100 text-gray-600 border-gray-200';

        const colors = [
            { light: 'bg-blue-100 text-blue-700 border-blue-200', dark: 'bg-blue-900/40 text-blue-300 border-blue-800' },
            { light: 'bg-purple-100 text-purple-700 border-purple-200', dark: 'bg-purple-900/40 text-purple-300 border-purple-800' },
            { light: 'bg-emerald-100 text-emerald-700 border-emerald-200', dark: 'bg-emerald-900/40 text-emerald-300 border-emerald-800' },
            { light: 'bg-amber-100 text-amber-700 border-amber-200', dark: 'bg-amber-900/40 text-amber-300 border-amber-800' },
            { light: 'bg-rose-100 text-rose-700 border-rose-200', dark: 'bg-rose-900/40 text-rose-300 border-rose-800' },
            { light: 'bg-indigo-100 text-indigo-700 border-indigo-200', dark: 'bg-indigo-900/40 text-indigo-300 border-indigo-800' },
            { light: 'bg-cyan-100 text-cyan-700 border-cyan-200', dark: 'bg-cyan-900/40 text-cyan-300 border-cyan-800' }
        ];

        let hash = 0;
        for (let i = 0; i < category.length; i++) {
            hash = category.charCodeAt(i) + ((hash << 5) - hash);
        }
        const color = colors[Math.abs(hash) % colors.length];
        return darkMode ? color.dark : color.light;
    };

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
                    <div className="mb-6">
                        <div className="flex items-start justify-between">
                            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                                Profil Listesi
                            </h2>
                            {!loading && !error && filteredProfiles.length > 0 && selectedProfiles.length > 0 && (
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" checked={selectedProfiles.length === filteredProfiles.length} onChange={toggleSelectAll} className="w-4 h-4 rounded cursor-pointer" />
                                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tümünü Seç</span>
                                    </div>
                                    {/* Bulk Edit */}
                                    <div className="relative">
                                        <button onClick={() => setBulkEditModal({ isOpen: !bulkEditModal.isOpen, newCategory: '' })} className={`p-2 rounded-lg font-medium transition-colors ${darkMode ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/40' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`} title={`${selectedProfiles.length} profil düzenle`}>
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        {bulkEditModal.isOpen && (
                                            <div className={`absolute right-0 top-full mt-2 w-80 rounded-lg shadow-xl p-4 z-50 ${darkMode ? 'bg-[#1E293B] border border-[#334155]' : 'bg-white border border-gray-200'}`}>
                                                <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    <span className={`font-bold px-2 py-1 rounded ${darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>{selectedProfiles.length} profil</span> için kategori güncellenecek.
                                                </p>
                                                <input
                                                    type="text"
                                                    value={bulkEditModal.newCategory}
                                                    onChange={(e) => setBulkEditModal({ ...bulkEditModal, newCategory: e.target.value })}
                                                    placeholder="Kategori girin"
                                                    className={`w-full px-3 py-1.5 mb-3 text-sm rounded border focus:ring-2 focus:ring-blue-500 outline-none ${darkMode ? 'bg-[#0F172A] border-[#334155] text-white placeholder-gray-500' : 'bg-white border-gray-300 text-black'}`}
                                                />
                                                {bulkEditStatus.message && (
                                                    <div className={`mb-3 p-2 rounded text-xs ${bulkEditStatus.type === 'error' ? darkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600' : darkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-600'}`}>
                                                        {bulkEditStatus.message}
                                                    </div>
                                                )}
                                                <div className="flex gap-2">
                                                    <button onClick={handleBulkEdit} disabled={bulkEditStatus.loading} className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm rounded font-medium transition-colors">
                                                        {bulkEditStatus.loading ? 'Güncelleniyor...' : 'Güncelle'}
                                                    </button>
                                                    <button onClick={() => { setBulkEditModal({ isOpen: false, newCategory: '' }); setBulkEditStatus({ loading: false, message: null, type: null }); }} disabled={bulkEditStatus.loading} className={`flex-1 py-1.5 px-3 text-sm rounded font-medium transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'}`}>İptal</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <button onClick={() => setBulkDeleteConfirm(!bulkDeleteConfirm)} className={`p-2 rounded-lg font-medium transition-colors ${darkMode ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-600 hover:bg-red-100'}`} title={`${selectedProfiles.length} profil sil`}>
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        {bulkDeleteConfirm && (
                                            <div className={`absolute right-0 top-full mt-2 w-80 rounded-lg shadow-xl p-4 z-50 ${darkMode ? 'bg-[#1E293B] border border-[#334155]' : 'bg-white border border-gray-200'}`}>
                                                <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    <span className={`font-bold px-2 py-1 rounded ${darkMode ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-700'}`}>{selectedProfiles.length} profil</span> silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                                                </p>
                                                <div className="flex gap-2">
                                                    <button onClick={handleBulkDelete} className="flex-1 py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white text-sm rounded font-medium transition-colors">Evet, Sil</button>
                                                    <button onClick={() => setBulkDeleteConfirm(false)} className={`flex-1 py-1.5 px-3 text-sm rounded font-medium transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'}`}>İptal</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

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
                                            <div className="flex items-start gap-4">
                                                <input type="checkbox" checked={selectedProfiles.includes(profile.id)} onChange={() => toggleProfileSelection(profile.id)} className="w-5 h-5 rounded cursor-pointer flex-shrink-0 self-center" onClick={(e) => e.stopPropagation()} />
                                                <div className="flex flex-col items-center gap-3 flex-shrink-0">
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
                                                            className="w-20 h-20 rounded-full object-cover hover:opacity-80 transition-opacity cursor-pointer border-2 border-gray-300"
                                                            onError={(e) => {
                                                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="24" fill="%23999"%3E?%3C/text%3E%3C/svg%3E';
                                                            }}
                                                        />
                                                    </a>

                                                    {/* Connections */}
                                                    {profile.connections && profile.connections.length > 0 && (
                                                        <div className="flex items-center gap-1.5 flex-wrap justify-center max-w-[100px]">
                                                            {profile.connections.map((conn, i) => (
                                                                <a
                                                                    key={i}
                                                                    href={conn.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className={`p-1 rounded-md transition-colors ${darkMode
                                                                        ? 'bg-gray-800/50 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700'
                                                                        : 'bg-white hover:bg-gray-50 text-gray-500 hover:text-black border border-gray-200 shadow-sm'
                                                                        }`}
                                                                    title={conn.platform}
                                                                >
                                                                    <PlatformIcon platform={conn.platform} className="w-3.5 h-3.5" />
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

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
                                                        <div className="flex items-center gap-2">
                                                            <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                Kategori:
                                                            </span>{' '}
                                                            {profile.category ? (
                                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getCategoryBadgeColor(profile.category)}`}>
                                                                    {profile.category}
                                                                </span>
                                                            ) : (
                                                                <span className={darkMode ? 'text-gray-300' : 'text-gray-900'}>-</span>
                                                            )}
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
                                                <div className="flex flex-col gap-2 ml-4 self-center">
                                                    <button
                                                        onClick={() => setEditProfile({
                                                            isOpen: true,
                                                            profile,
                                                            newCategory: profile.category || '',
                                                            connections: (profile.connections || []).map(conn => ({
                                                                ...conn,
                                                                url: sanitizeUsername(conn.url)
                                                            }))
                                                        })}
                                                        className={`p-2 rounded-lg transition-all ${darkMode ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/40' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                                        title="Düzenle"
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

                    {/* Pagination Controls */}
                    {!loading && !error && (
                        <div className={`mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl ${darkMode ? 'bg-[#1E293B] border border-[#334155]' : 'bg-white shadow-lg'}`}>

                            {/* Page Size Selector */}
                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800/50 p-1.5 rounded-lg border border-gray-100 dark:border-slate-700">
                                <span className={`text-sm font-medium pl-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Sayfa Boyutu:
                                </span>
                                <div className="relative">
                                    <select
                                        value={pageSize}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setPageSize(val === 'all' ? 'all' : Number(val));
                                            setPage(1);
                                        }}
                                        className={`appearance-none pl-4 pr-8 py-1.5 text-sm font-bold rounded-md outline-none cursor-pointer transition-colors ${darkMode
                                            ? 'bg-slate-800 text-white hover:bg-slate-700'
                                            : 'bg-white text-gray-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value="all">Hepsi</option>
                                    </select>
                                    <div className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(1)}
                                    disabled={page === 1}
                                    className={`p-2 rounded-lg transition-all ${page === 1
                                        ? 'opacity-30 cursor-not-allowed text-gray-400'
                                        : darkMode
                                            ? 'text-gray-400 hover:text-white hover:bg-slate-800'
                                            : 'text-gray-600 hover:text-black hover:bg-gray-100'
                                        }`}
                                    title="İlk Sayfa"
                                >
                                    <ChevronsLeft className="w-6 h-6" />
                                </button>

                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className={`p-2 rounded-lg transition-all ${page === 1
                                        ? 'opacity-30 cursor-not-allowed text-gray-400'
                                        : darkMode
                                            ? 'text-gray-400 hover:text-white hover:bg-slate-800'
                                            : 'text-gray-600 hover:text-black hover:bg-gray-100'
                                        }`}
                                    title="Önceki Sayfa"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>

                                <div className={`px-4 py-2 rounded-lg font-bold min-w-[3rem] text-center ${darkMode ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                    {page}
                                </div>

                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={pageSize === 'all' || profiles?.length < pageSize}
                                    className={`p-2 rounded-lg transition-all ${(pageSize === 'all' || profiles?.length < pageSize)
                                        ? 'opacity-30 cursor-not-allowed text-gray-400'
                                        : darkMode
                                            ? 'text-gray-400 hover:text-white hover:bg-slate-800'
                                            : 'text-gray-600 hover:text-black hover:bg-gray-100'
                                        }`}
                                    title="Sonraki Sayfa"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>
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
                connectionDropdownOpen={modal.connectionDropdownOpen}
                addConnection={modal.addConnection}
                removeConnection={modal.removeConnection}
                updateConnection={modal.updateConnection}
                toggleConnectionDropdown={modal.toggleConnectionDropdown}
                selectConnectionPlatform={modal.selectConnectionPlatform}
            />


            {/* Edit Profile Modal */}
            {editProfile.isOpen && editProfile.profile && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            e.currentTarget.dataset.backdropClicked = 'true';
                        }
                    }}
                    onMouseUp={(e) => {
                        if (e.target === e.currentTarget && e.currentTarget.dataset.backdropClicked === 'true') {
                            setEditProfile({ isOpen: false, profile: null, newCategory: '' });
                            setEditStatus({ loading: false, message: null, type: null });
                        }
                        delete e.currentTarget.dataset.backdropClicked;
                    }}
                >
                    <div
                        className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${darkMode ? 'bg-[#1E293B] border border-[#334155]' : 'bg-white'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-black'}`}>
                            Profil Düzenle
                        </h3>

                        {/* Profile Info Section */}
                        <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-[#0F172A]' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-4">
                                {/* Profile Image */}
                                <a
                                    href={editProfile.profile.profile_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0"
                                >
                                    <img
                                        src={editProfile.profile.profile_image || '/default-avatar.png'}
                                        alt={extractProfileName(editProfile.profile.profile_url)}
                                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 hover:opacity-80 transition-opacity cursor-pointer"
                                        onError={(e) => {
                                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect width="64" height="64" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="24" fill="%23999"%3E?%3C/text%3E%3C/svg%3E';
                                        }}
                                    />
                                </a>

                                {/* Profile Name and Platform */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={editProfile.profile.profile_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`font-bold text-lg hover:underline ${darkMode ? 'text-white' : 'text-black'}`}
                                        >
                                            {extractProfileName(editProfile.profile.profile_url)}
                                        </a>
                                        <div className={darkMode ? 'text-[#E2E8F0]' : 'text-gray-800'}>
                                            {(editProfile.profile.platform || '').toLowerCase() === 'instagram' ? (
                                                <Instagram className="w-5 h-5" />
                                            ) : (
                                                <XIcon className="w-5 h-5" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Category Input */}
                        <div className="mb-6">
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Kategori
                            </label>
                            <input
                                type="text"
                                value={editProfile.newCategory}
                                onChange={(e) => setEditProfile({ ...editProfile, newCategory: e.target.value })}
                                placeholder="Kategori girin (örn: teknoloji, spor)"
                                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${darkMode ? 'bg-[#0F172A] border-[#334155] text-white placeholder-gray-500' : 'bg-white border-gray-300 text-black'}`}
                            />
                        </div>

                        <div className={`h-px w-full mb-6 ${darkMode ? 'bg-[#334155]' : 'bg-gray-100'}`} />

                        {/* Connections Section */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Bağlantılar
                                </label>
                                <button
                                    type="button"
                                    onClick={addEditConnection}
                                    className="flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors bg-blue-500/10 px-2 py-1 rounded-md"
                                >
                                    <Plus className="w-3 h-3" />
                                    Yeni Ekle
                                </button>
                            </div>

                            {editProfile.connections.length === 0 ? (
                                <div className={`text-center py-6 rounded-xl border-2 border-dashed ${darkMode ? 'border-slate-800 text-slate-500' : 'border-gray-100 text-gray-400'}`}>
                                    <p className="text-sm">Henüz bağlantı eklenmemiş</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {editProfile.connections.map((conn, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <div className="relative flex-shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleEditConnectionDropdown(index)}
                                                    className={`h-[38px] flex items-center gap-2 px-3 rounded-lg border text-sm transition-all ${darkMode ? 'bg-[#0F172A] border-[#334155] text-white' : 'bg-gray-50 border-gray-200 text-black'}`}
                                                >
                                                    <PlatformIcon platform={conn.platform} className="w-4 h-4" />
                                                    <ChevronDown className={`w-3 h-3 transition-transform ${editConnectionDropdownOpen === index ? 'rotate-180' : ''}`} />
                                                </button>

                                                {editConnectionDropdownOpen === index && (
                                                    <div className={`absolute top-full left-0 mt-1 w-40 rounded-lg shadow-xl py-1 z-50 ${darkMode ? 'bg-[#1E293B] border border-[#334155]' : 'bg-white border border-gray-100'}`}>
                                                        {Object.values(PLATFORMS).map(platform => (
                                                            <button
                                                                key={platform}
                                                                type="button"
                                                                onClick={() => selectEditConnectionPlatform(index, platform.toLowerCase())}
                                                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-blue-500/10 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                                                            >
                                                                <PlatformIcon platform={platform} className="w-4 h-4" />
                                                                <span>{platform}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                type="url"
                                                value={conn.url}
                                                onChange={(e) => updateEditConnection(index, 'url', e.target.value)}
                                                placeholder="kullanıcı adı"
                                                className={`flex-1 px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${darkMode ? 'bg-[#0F172A] border-[#334155] text-white placeholder-gray-500' : 'bg-white border-gray-300 text-black'}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeEditConnection(index)}
                                                className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-red-400 hover:bg-red-400/10' : 'text-red-500 hover:bg-red-50'}`}
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Status Message */}
                        {editStatus.message && (
                            <div className={`mb-6 p-4 rounded-xl text-sm font-medium border ${editStatus.type === 'error'
                                ? darkMode ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-100'
                                : darkMode ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-green-50 text-green-600 border-green-100'
                                }`}>
                                {editStatus.message}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    setEditProfile({ isOpen: false, profile: null, newCategory: '', connections: [] });
                                    setEditConnectionDropdownOpen(null);
                                    setEditStatus({ loading: false, message: null, type: null });
                                }}
                                disabled={editStatus.loading}
                                className={`flex-1 py-3 rounded-xl font-bold transition-all ${darkMode ? 'bg-[#0F172A] text-gray-400 hover:bg-[#0F172A]/80' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleEditProfile}
                                disabled={editStatus.loading}
                                className={`flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2`}
                            >
                                {editStatus.loading ? <LoadingSpinner size="sm" color="white" fullPage={false} message={null} /> : 'Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm.isOpen && deleteConfirm.profile && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            e.currentTarget.dataset.backdropClicked = 'true';
                        }
                    }}
                    onMouseUp={(e) => {
                        if (e.target === e.currentTarget && e.currentTarget.dataset.backdropClicked === 'true') {
                            setDeleteConfirm({ isOpen: false, profile: null });
                        }
                        delete e.currentTarget.dataset.backdropClicked;
                    }}
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
