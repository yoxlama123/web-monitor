import React from 'react';
import { Instagram, Plus, Trash, ChevronDown } from 'lucide-react';
import { Profile, Connection, Status } from '../../types';
import { extractProfileName, sanitizeUsername } from '../../utils/url';
import { PlatformIcon } from '../icons/PlatformIcons';
import { PLATFORMS } from '../../constants';
import LoadingSpinner from '../common/LoadingSpinner';
import { XIcon } from '../../utils/ui';

interface EditProfileModalProps {
    darkMode: boolean;
    editProfile: { isOpen: boolean; profile: Profile | null; newCategory: string; connections: Connection[] };
    setEditProfile: React.Dispatch<React.SetStateAction<EditProfileModalProps['editProfile']>>;
    editStatus: Status;
    onSave: () => void;
    onClose: () => void;
    editConnectionDropdownOpen: number | null;
    setEditConnectionDropdownOpen: (index: number | null) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
    darkMode,
    editProfile,
    setEditProfile,
    editStatus,
    onSave,
    onClose,
    editConnectionDropdownOpen,
    setEditConnectionDropdownOpen
}) => {
    if (!editProfile.isOpen || !editProfile.profile) return null;


    const addConnection = () => {
        setEditProfile(prev => ({
            ...prev,
            connections: [...prev.connections, { platform: 'instagram', url: '' }]
        }));
    };

    const removeConnection = (index: number) => {
        setEditProfile(prev => ({
            ...prev,
            connections: prev.connections.filter((_, i) => i !== index)
        }));
    };

    const updateConnection = (index: number, field: keyof Connection, value: string) => {
        const processedValue = field === 'url' ? sanitizeUsername(value) : value;
        setEditProfile(prev => ({
            ...prev,
            connections: prev.connections.map((conn, i) =>
                i === index ? { ...conn, [field]: processedValue } : conn
            )
        }));
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${darkMode ? 'bg-[#1E293B] border border-[#334155]' : 'bg-white'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-black'}`}>Profil Düzenle</h3>

                <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-[#0F172A]' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-4">
                        <a href={editProfile.profile.profile_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                            <img
                                src={editProfile.profile.profile_image || '/default-avatar.png'}
                                alt={extractProfileName(editProfile.profile.profile_url)}
                                className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 hover:opacity-80 transition-opacity cursor-pointer"
                                onError={(e: any) => {
                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect width="64" height="64" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="24" fill="%23999"%3E?%3C/text%3E%3C/svg%3E';
                                }}
                            />
                        </a>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <a href={editProfile.profile.profile_url} target="_blank" rel="noopener noreferrer" className={`font-bold text-lg hover:underline ${darkMode ? 'text-white' : 'text-black'}`}>
                                    {extractProfileName(editProfile.profile.profile_url)}
                                </a>
                                <div className={darkMode ? 'text-[#E2E8F0]' : 'text-gray-800'}>
                                    {(editProfile.profile.platform || '').toLowerCase() === 'instagram' ? <Instagram className="w-5 h-5" /> : <XIcon className="w-5 h-5" />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Kategori</label>
                    <input
                        type="text"
                        value={editProfile.newCategory}
                        onChange={(e) => setEditProfile({ ...editProfile, newCategory: e.target.value })}
                        placeholder="Kategori girin"
                        className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${darkMode ? 'bg-[#0F172A] border-[#334155] text-white placeholder-gray-500' : 'bg-white border-gray-300 text-black'}`}
                    />
                </div>

                <div className={`h-px w-full mb-6 ${darkMode ? 'bg-[#334155]' : 'bg-gray-100'}`} />

                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Bağlantılar</label>
                        <button type="button" onClick={addConnection} className="flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors bg-blue-500/10 px-2 py-1 rounded-md">
                            <Plus className="w-3 h-3" /> Yeni Ekle
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
                                            onClick={() => setEditConnectionDropdownOpen(editConnectionDropdownOpen === index ? null : index)}
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
                                                        onClick={() => { updateConnection(index, 'platform', platform.toLowerCase()); setEditConnectionDropdownOpen(null); }}
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
                                        onChange={(e) => updateConnection(index, 'url', e.target.value)}
                                        placeholder="kullanıcı adı"
                                        className={`flex-1 px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${darkMode ? 'bg-[#0F172A] border-[#334155] text-white placeholder-gray-500' : 'bg-white border-gray-300 text-black'}`}
                                    />
                                    <button type="button" onClick={() => removeConnection(index)} className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-red-400 hover:bg-red-400/10' : 'text-red-500 hover:bg-red-50'}`}>
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {editStatus.message && (
                    <div className={`mb-6 p-4 rounded-xl text-sm font-medium border ${editStatus.type === 'error' ? darkMode ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-100' : darkMode ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-green-50 text-green-600 border-green-100'}`}>
                        {editStatus.message}
                    </div>
                )}

                <div className="flex gap-4">
                    <button onClick={onClose} disabled={editStatus.loading} className={`flex-1 py-3 rounded-xl font-bold transition-all ${darkMode ? 'bg-[#0F172A] text-gray-400 hover:bg-[#0F172A]/80' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>İptal</button>
                    <button onClick={onSave} disabled={editStatus.loading} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2">
                        {editStatus.loading ? <LoadingSpinner size="sm" color="white" fullPage={false} message={null} /> : 'Kaydet'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;
