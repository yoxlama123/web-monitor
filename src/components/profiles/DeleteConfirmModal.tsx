import React from 'react';
import { Profile } from '../../types';
import { extractProfileName } from '../../utils/url';

interface DeleteConfirmModalProps {
    darkMode: boolean;
    deleteConfirm: { isOpen: boolean; profile: Profile | null };
    onConfirm: (profile: Profile) => void;
    onClose: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
    darkMode,
    deleteConfirm,
    onConfirm,
    onClose
}) => {
    if (!deleteConfirm.isOpen || !deleteConfirm.profile) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${darkMode ? 'bg-[#1E293B] border border-[#334155]' : 'bg-white'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>Profil Silme Onayı</h3>
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
                    <button onClick={() => onConfirm(deleteConfirm.profile!)} className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">Evet, Sil</button>
                    <button onClick={onClose} className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'}`}>İptal</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
