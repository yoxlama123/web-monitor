import React from 'react';
import { useApp } from '../context/AppContext';
import { useModalState } from '../hooks/useModalState';
import { useProfileManager } from '../hooks/useProfileManager';
import { buildProfileUrl, sanitizeUsername } from '../utils/url';
import { ANIMATION_DELAYS } from '../constants';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorDisplay from '../components/common/ErrorDisplay';

// Sub-components
import ProfileCard from '../components/profiles/ProfileCard';
import BulkActionsBar from '../components/profiles/BulkActionsBar';
import EditProfileModal from '../components/profiles/EditProfileModal';
import DeleteConfirmModal from '../components/profiles/DeleteConfirmModal';
import Pagination from '../components/profiles/Pagination';

const ListProfiles: React.FC = () => {
    const { darkMode, setDarkMode, filter, setFilter } = useApp();
    const modal = useModalState();

    // Use the new profile manager hook
    const {
        profiles,
        loading,
        error,
        refetch,
        page,
        setPage,
        pageSize,
        setPageSize,
        selectedProfiles,
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
    } = useProfileManager(5);

    // Calculate counts
    const counts = {
        all: profiles?.length || 0,
        instagram: profiles?.filter(p => (p.platform || '').toLowerCase() === 'instagram')?.length || 0,
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

    // Handle command submission (Add/Remove)
    const handleCommand = async () => {
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
                            <BulkActionsBar
                                darkMode={darkMode}
                                selectedCount={selectedProfiles.length}
                                isSelectedAll={selectedProfiles.length === (filteredProfiles?.length || 0) && (filteredProfiles?.length || 0) > 0}
                                onToggleSelectAll={() => toggleSelectAll(filteredProfiles.map(p => p.id))}
                                bulkEditModal={bulkEditModal}
                                setBulkEditModal={setBulkEditModal}
                                bulkEditStatus={bulkEditStatus}
                                onBulkEdit={handleBulkEdit}
                                bulkDeleteConfirm={bulkDeleteConfirm}
                                setBulkDeleteConfirm={setBulkDeleteConfirm}
                                onBulkDelete={handleBulkDelete}
                            />
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
                            {filteredProfiles.map((profile, index) => (
                                <ProfileCard
                                    key={profile.id || index}
                                    profile={profile}
                                    darkMode={darkMode}
                                    isSelected={selectedProfiles.includes(profile.id)}
                                    onToggleSelection={toggleProfileSelection}
                                    onEdit={(p) => setEditProfile({
                                        isOpen: true,
                                        profile: p,
                                        newCategory: p.category || '',
                                        connections: (p.connections || []).map(conn => ({
                                            ...conn,
                                            url: sanitizeUsername(conn.url)
                                        }))
                                    })}
                                    onDelete={(p) => setDeleteConfirm({ isOpen: true, profile: p })}
                                />
                            ))}
                        </div>
                    )}

                    {!loading && !error && (
                        <Pagination
                            darkMode={darkMode}
                            page={page}
                            setPage={setPage}
                            pageSize={pageSize}
                            setPageSize={setPageSize}
                            currentItemsCount={profiles?.length || 0}
                        />
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
                    message: webhook.error || (webhook as any).success, // Cast as any for quick fix if success is missing in types
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

            <EditProfileModal
                darkMode={darkMode}
                editProfile={editProfile}
                setEditProfile={setEditProfile}
                editStatus={editStatus}
                onSave={handleEditProfile}
                onClose={() => {
                    setEditProfile({ isOpen: false, profile: null, newCategory: '', connections: [] });
                    setEditConnectionDropdownOpen(null);
                }}
                editConnectionDropdownOpen={editConnectionDropdownOpen}
                setEditConnectionDropdownOpen={setEditConnectionDropdownOpen}
            />

            <DeleteConfirmModal
                darkMode={darkMode}
                deleteConfirm={deleteConfirm}
                onConfirm={handleDeleteProfile}
                onClose={() => setDeleteConfirm({ isOpen: false, profile: null })}
            />
        </>
    );
};

export default ListProfiles;
