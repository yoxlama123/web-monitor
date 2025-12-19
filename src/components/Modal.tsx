import React from 'react';
import { Instagram, X, Plus, Trash2, ChevronDown } from 'lucide-react';
import FormInput from './common/FormInput';
import { PlatformIcon } from './icons/PlatformIcons';
import { PLATFORMS } from '@/constants';
import { Connection } from '../types';
import { XIcon } from '../utils/ui';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'add' | 'remove' | null;
    darkMode: boolean;
    formData: {
        url: string;
        category: string;
        platform: string;
        connections: Connection[];
    };
    onFormChange: (field: any, value: any) => void;
    isPlatformDropdownOpen: boolean;
    onPlatformToggle: () => void;
    onPlatformSelect: (platform: string) => void;
    status: {
        loading: boolean;
        message: string | null;
        type: 'success' | 'error';
    };
    onSubmit: () => void;
    connectionDropdownOpen: number | null;
    addConnection: () => void;
    removeConnection: (index: number) => void;
    updateConnection: (index: number, field: keyof Connection, value: string) => void;
    toggleConnectionDropdown: (index: number) => void;
    selectConnectionPlatform: (index: number, platform: string) => void;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    type,
    darkMode,
    formData,
    onFormChange,
    isPlatformDropdownOpen,
    onPlatformToggle,
    onPlatformSelect,
    status,
    onSubmit,
    // Connection props
    connectionDropdownOpen,
    addConnection,
    removeConnection,
    updateConnection,
    toggleConnectionDropdown,
    selectConnectionPlatform
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
                if (e.target === e.currentTarget) {
                    (e.currentTarget as any).dataset.backdropClicked = 'true';
                }
            }}
            onMouseUp={(e: React.MouseEvent<HTMLDivElement>) => {
                if (e.target === e.currentTarget && (e.currentTarget as any).dataset.backdropClicked === 'true') {
                    onClose();
                }
                delete (e.currentTarget as any).dataset.backdropClicked;
            }}
        >
            <div
                className={`w-full max-w-md rounded-2xl shadow-2xl p-6 relative ${darkMode ? 'bg-[#1E293B] border border-[#334155]' : 'bg-white'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className={`absolute top-4 right-4 p-1 rounded-full transition-colors ${darkMode ? 'hover:bg-[#334155] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                    <X className="w-5 h-5" />
                </button>

                <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-black'}`}>
                    {type === 'add' ? 'Yeni Bağlantı Ekle' : 'Bağlantı Kaldır'}
                </h3>

                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="w-1/3">
                            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Platform</label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={onPlatformToggle}
                                    className={`w-full px-4 h-[42px] rounded-lg border outline-none transition-all flex items-center justify-center ${darkMode ? 'bg-[#0F172A] border-[#334155] text-white' : 'bg-white border-gray-300 text-black'}`}
                                >
                                    {formData.platform === PLATFORMS.INSTAGRAM ? <Instagram className="w-5 h-5" /> : <XIcon className="w-5 h-5" />}
                                </button>

                                {isPlatformDropdownOpen && (
                                    <div className={`absolute top-full left-0 right-0 mt-1 rounded-lg border shadow-lg z-10 ${darkMode ? 'bg-[#0F172A] border-[#334155]' : 'bg-white border-gray-300'}`}>
                                        <button
                                            type="button"
                                            onClick={() => onPlatformSelect(PLATFORMS.INSTAGRAM)}
                                            className={`w-full px-4 py-2 flex items-center justify-center transition-colors rounded-t-lg ${formData.platform === PLATFORMS.INSTAGRAM ? (darkMode ? 'bg-[#334155]' : 'bg-blue-50') : (darkMode ? 'hover:bg-[#1E293B]' : 'hover:bg-gray-50')} ${darkMode ? 'text-white' : 'text-black'}`}
                                        >
                                            <Instagram className="w-5 h-5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onPlatformSelect(PLATFORMS.X)}
                                            className={`w-full px-4 py-2 flex items-center justify-center transition-colors rounded-b-lg ${formData.platform === PLATFORMS.X ? (darkMode ? 'bg-[#334155]' : 'bg-blue-50') : (darkMode ? 'hover:bg-[#1E293B]' : 'hover:bg-gray-50')} ${darkMode ? 'text-white' : 'text-black'}`}
                                        >
                                            <XIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="w-2/3">
                            <FormInput
                                label="Kullanıcı Adı"
                                value={formData.url}
                                onChange={(e) => onFormChange('url', e.target.value)}
                                placeholder="kullanıcı adı"
                                darkMode={darkMode}
                            />
                        </div>
                    </div>

                    {type === 'add' && (
                        <FormInput
                            label="Kategori (İsteğe Bağlı)"
                            value={formData.category}
                            onChange={(e) => onFormChange('category', e.target.value)}
                            placeholder="Örn: Sfw"
                            darkMode={darkMode}
                        />
                    )}

                    {type === 'add' && (
                        <div className="space-y-3">
                            <div className={`h-[1px] w-full ${darkMode ? 'bg-gray-700' : ''}`} style={{ backgroundColor: darkMode ? undefined : 'rgba(0,0,0,0.05)' }} />
                            <div className="flex items-center justify-between">
                                <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Bağlantılar
                                </label>
                                <button
                                    type="button"
                                    onClick={addConnection}
                                    className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${darkMode
                                        ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50'
                                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                        }`}
                                >
                                    <Plus className="w-3 h-3" />
                                    Yeni Bağlantı
                                </button>
                            </div>

                            <div className="space-y-3">
                                {formData.connections?.map((conn, index) => (
                                    <div key={index} className="flex gap-2 items-start">
                                        {/* Platform Dropdown */}
                                        <div className="w-[80px] relative">
                                            <div
                                                onClick={() => toggleConnectionDropdown(index)}
                                                className={`cursor-pointer px-2 h-[38px] rounded-lg border flex items-center justify-between gap-1 ${darkMode
                                                    ? 'bg-[#0F172A] border-[#334155] text-white'
                                                    : 'bg-white border-gray-300 text-black'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-center flex-1">
                                                    <PlatformIcon platform={conn.platform} className="w-4 h-4" />
                                                </div>
                                                <ChevronDown className="w-3 h-3 opacity-50" />
                                            </div>

                                            {connectionDropdownOpen === index && (
                                                <div className={`absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg border shadow-lg z-20 ${darkMode ? 'bg-[#0F172A] border-[#334155]' : 'bg-white border-gray-300'
                                                    }`}>
                                                    {Object.values(PLATFORMS).map((platform) => (
                                                        <button
                                                            key={platform}
                                                            type="button"
                                                            onClick={() => selectConnectionPlatform(index, platform)}
                                                            className={`w-full px-3 py-2 flex items-center justify-center transition-colors ${conn.platform === platform
                                                                ? (darkMode ? 'bg-[#334155]' : 'bg-blue-50')
                                                                : (darkMode ? 'hover:bg-[#1E293B]' : 'hover:bg-gray-50')
                                                                } ${darkMode ? 'text-white' : 'text-black'}`}
                                                        >
                                                            <PlatformIcon platform={platform} className="w-4 h-4" />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Username Input */}
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={conn.url}
                                                onChange={(e) => updateConnection(index, 'url', e.target.value)}
                                                placeholder="kullanıcı adı"
                                                className={`w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${darkMode
                                                    ? 'bg-[#0F172A] border-[#334155] text-white placeholder-gray-500'
                                                    : 'bg-white border-gray-300 text-black'
                                                    }`}
                                            />
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            type="button"
                                            onClick={() => removeConnection(index)}
                                            className={`p-2 rounded-lg transition-colors ${darkMode
                                                ? 'hover:bg-red-900/30 text-gray-400 hover:text-red-400'
                                                : 'hover:bg-red-50 text-gray-400 hover:text-red-600'
                                                }`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {status.message && (
                        <div className={`p-3 rounded-lg text-sm ${status.type === 'success' ? (darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700') : (darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700')}`}>
                            {status.message}
                        </div>
                    )}

                    <button
                        onClick={onSubmit}
                        disabled={status.loading}
                        className={`w-full py-3 rounded-xl font-bold text-white transition-all ${type === 'add' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'} ${status.loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {status.loading ? 'İşleniyor...' : (type === 'add' ? 'Ekle' : 'Kaldır')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
