import React from 'react';
import { Instagram, X } from 'lucide-react';
import FormInput from './common/FormInput';
import { PLATFORMS } from '../constants';

const Modal = ({
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
    onSubmit
}) => {
    if (!isOpen) return null;

    const XIcon = ({ className }) => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    e.currentTarget.dataset.backdropClicked = 'true';
                }
            }}
            onMouseUp={(e) => {
                if (e.target === e.currentTarget && e.currentTarget.dataset.backdropClicked === 'true') {
                    onClose();
                }
                delete e.currentTarget.dataset.backdropClicked;
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
                                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all flex items-center justify-center ${darkMode ? 'bg-[#0F172A] border-[#334155] text-white' : 'bg-white border-gray-300 text-black'}`}
                                >
                                    {formData.platform === PLATFORMS.INSTAGRAM ? <Instagram className="w-5 h-5" /> : <XIcon className="w-5 h-5" />}
                                </button>

                                {isPlatformDropdownOpen && (
                                    <div className={`absolute top-full left-0 right-0 mt-1 rounded-lg border shadow-lg z-10 ${darkMode ? 'bg-[#0F172A] border-[#334155]' : 'bg-white border-gray-300'}`}>
                                        <button
                                            type="button"
                                            onClick={() => onPlatformSelect(PLATFORMS.INSTAGRAM)}
                                            className={`w-full px-4 py-2 flex items-center gap-2 transition-colors rounded-t-lg ${formData.platform === PLATFORMS.INSTAGRAM ? (darkMode ? 'bg-[#334155]' : 'bg-blue-50') : (darkMode ? 'hover:bg-[#1E293B]' : 'hover:bg-gray-50')} ${darkMode ? 'text-white' : 'text-black'}`}
                                        >
                                            <Instagram className="w-5 h-5" />
                                            <span>Instagram</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onPlatformSelect(PLATFORMS.X)}
                                            className={`w-full px-4 py-2 flex items-center gap-2 transition-colors rounded-b-lg ${formData.platform === PLATFORMS.X ? (darkMode ? 'bg-[#334155]' : 'bg-blue-50') : (darkMode ? 'hover:bg-[#1E293B]' : 'hover:bg-gray-50')} ${darkMode ? 'text-white' : 'text-black'}`}
                                        >
                                            <XIcon className="w-5 h-5" />
                                            <span>X</span>
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
