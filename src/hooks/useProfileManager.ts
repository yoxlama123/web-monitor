import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useWebhook } from './useWebhook';
import { useFetch } from './useFetch';
import { Profile, Connection, Status } from '../types';
import { buildProfileUrl } from '../utils/url';

export const useProfileManager = (initialPageSize: number | 'all' = 5) => {
    const webhook = useWebhook();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<number | 'all'>(initialPageSize);
    const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);

    // Modals state
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; profile: Profile | null }>({
        isOpen: false,
        profile: null
    });

    const [editProfile, setEditProfile] = useState<{
        isOpen: boolean;
        profile: Profile | null;
        newCategory: string;
        connections: Connection[]
    }>({
        isOpen: false,
        profile: null,
        newCategory: '',
        connections: []
    });

    const [editStatus, setEditStatus] = useState<Status>({
        loading: false,
        message: null,
        type: null
    });

    const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
    const [bulkEditModal, setBulkEditModal] = useState<{ isOpen: boolean; newCategory: string }>({
        isOpen: false,
        newCategory: ''
    });

    const [bulkEditStatus, setBulkEditStatus] = useState<Status>({
        loading: false,
        message: null,
        type: null
    });

    const [editConnectionDropdownOpen, setEditConnectionDropdownOpen] = useState<number | null>(null);

    // Fetch profiles - useFetch zaten ilk yüklemede otomatik fetch yapar
    // page veya pageSize değiştiğinde deps sayesinde yeniden fetch tetiklenir
    const { data: profiles, loading, error, refetch } = useFetch(
        () => api.listProfiles({ page, pageSize }),
        [page, pageSize]
    );

    // Handlers
    const handleDeleteProfile = async (profile: Profile) => {
        try {
            await webhook.sendCommand('removeurl', {
                profile_url: profile.profile_url,
                platform: profile.platform
            });
            setDeleteConfirm({ isOpen: false, profile: null });
            refetch();
        } catch (err: any) {
            alert('Bir hata oluştu: ' + err.message);
            setDeleteConfirm({ isOpen: false, profile: null });
        }
    };

    const handleEditProfile = async () => {
        if (!editProfile.profile || !editProfile.newCategory.trim()) {
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
                connections: editProfile.connections.map(conn => ({
                    platform: conn.platform,
                    url: conn.url // conn.url zaten sanitize edilmiş username içeriyor
                }))
            };

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const responseData = await response.json();

            if (response.ok) {
                setEditStatus({
                    loading: false,
                    message: responseData.message || 'Profil başarıyla güncellendi!',
                    type: 'success'
                });

                setTimeout(() => {
                    setEditProfile({ isOpen: false, profile: null, newCategory: '', connections: [] });
                    setEditConnectionDropdownOpen(null);
                    setEditStatus({ loading: false, message: null, type: null });
                    refetch();
                }, 2000);
            } else {
                throw new Error(responseData.message || 'İşlem başarısız oldu.');
            }
        } catch (err: any) {
            setEditStatus({ loading: false, message: 'Bir hata oluştu: ' + err.message, type: 'error' });
        }
    };

    const handleBulkDelete = async () => {
        try {
            const webhookUrl = import.meta.env.VITE_COMMAND_WEBHOOK_URL || import.meta.env.VITE_WEBHOOK_URL;
            const urlString = selectedProfiles.map(id => {
                const profile = (profiles as Profile[]).find(p => p.id === id);
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
        } catch (err: any) {
            alert('Bir hata oluştu: ' + err.message);
            setBulkDeleteConfirm(false);
        }
    };

    const handleBulkEdit = async () => {
        if (!bulkEditModal.newCategory.trim()) {
            setBulkEditStatus({ loading: false, message: 'Lütfen kategori girin.', type: 'error' });
            return;
        }

        setBulkEditStatus({ loading: true, message: null, type: null });

        try {
            const webhookUrl = import.meta.env.VITE_COMMAND_WEBHOOK_URL || import.meta.env.VITE_WEBHOOK_URL;
            const urlString = selectedProfiles.map(id => {
                const profile = (profiles as Profile[]).find(p => p.id === id);
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
        } catch (err: any) {
            setBulkEditStatus({ loading: false, message: 'Bir hata oluştu: ' + err.message, type: 'error' });
        }
    };

    const toggleProfileSelection = (profileId: string) => {
        setSelectedProfiles(prev => prev.includes(profileId) ? prev.filter(id => id !== profileId) : [...prev, profileId]);
    };

    const toggleSelectAll = (filteredProfileIds: string[]) => {
        setSelectedProfiles(selectedProfiles.length === filteredProfileIds.length ? [] : filteredProfileIds);
    };

    return {
        profiles: profiles as Profile[],
        loading,
        error,
        refetch,
        page,
        setPage,
        pageSize,
        setPageSize,
        selectedProfiles,
        setSelectedProfiles,
        deleteConfirm,
        setDeleteConfirm,
        editProfile,
        setEditProfile,
        editStatus,
        bulkDeleteConfirm,
        setBulkDeleteConfirm,
        bulkEditModal,
        setBulkEditModal,
        bulkEditStatus,
        editConnectionDropdownOpen,
        setEditConnectionDropdownOpen,
        handleDeleteProfile,
        handleEditProfile,
        handleBulkDelete,
        handleBulkEdit,
        toggleProfileSelection,
        toggleSelectAll,
        webhook
    };
};
