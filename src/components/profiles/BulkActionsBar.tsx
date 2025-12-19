import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Status } from '../../types';

interface BulkActionsBarProps {
    darkMode: boolean;
    selectedCount: number;
    isSelectedAll: boolean;
    onToggleSelectAll: () => void;
    bulkEditModal: { isOpen: boolean; newCategory: string };
    setBulkEditModal: (state: { isOpen: boolean; newCategory: string }) => void;
    bulkEditStatus: Status;
    onBulkEdit: () => void;
    bulkDeleteConfirm: boolean;
    setBulkDeleteConfirm: (state: boolean) => void;
    onBulkDelete: () => void;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
    darkMode,
    selectedCount,
    isSelectedAll,
    onToggleSelectAll,
    bulkEditModal,
    setBulkEditModal,
    bulkEditStatus,
    onBulkEdit,
    bulkDeleteConfirm,
    setBulkDeleteConfirm,
    onBulkDelete
}) => {
    if (selectedCount === 0) return null;

    return (
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={isSelectedAll}
                    onChange={onToggleSelectAll}
                    className="w-4 h-4 rounded cursor-pointer"
                />
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tümünü Seç</span>
            </div>

            <div className="relative">
                <button
                    onClick={() => setBulkEditModal({ isOpen: !bulkEditModal.isOpen, newCategory: '' })}
                    className={`p-2 rounded-lg font-medium transition-colors ${darkMode ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/40' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                    title={`${selectedCount} profil düzenle`}
                >
                    <Edit2 className="w-4 h-4" />
                </button>
                {bulkEditModal.isOpen && (
                    <div className={`absolute right-0 top-full mt-2 w-80 rounded-lg shadow-xl p-4 z-50 ${darkMode ? 'bg-[#1E293B] border border-[#334155]' : 'bg-white border border-gray-200'}`}>
                        <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <span className={`font-bold px-2 py-1 rounded ${darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>{selectedCount} profil</span> için kategori güncellenecek.
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
                            <button onClick={onBulkEdit} disabled={bulkEditStatus.loading} className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm rounded font-medium transition-colors">
                                {bulkEditStatus.loading ? 'Güncelleniyor...' : 'Güncelle'}
                            </button>
                            <button onClick={() => setBulkEditModal({ isOpen: false, newCategory: '' })} disabled={bulkEditStatus.loading} className={`flex-1 py-1.5 px-3 text-sm rounded font-medium transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'}`}>İptal</button>
                        </div>
                    </div>
                )}
            </div>

            <div className="relative">
                <button
                    onClick={() => setBulkDeleteConfirm(!bulkDeleteConfirm)}
                    className={`p-2 rounded-lg font-medium transition-colors ${darkMode ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                    title={`${selectedCount} profil sil`}
                >
                    <Trash2 className="w-4 h-4" />
                </button>
                {bulkDeleteConfirm && (
                    <div className={`absolute right-0 top-full mt-2 w-80 rounded-lg shadow-xl p-4 z-50 ${darkMode ? 'bg-[#1E293B] border border-[#334155]' : 'bg-white border border-gray-200'}`}>
                        <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <span className={`font-bold px-2 py-1 rounded ${darkMode ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-700'}`}>{selectedCount} profil</span> silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                        </p>
                        <div className="flex gap-2">
                            <button onClick={onBulkDelete} className="flex-1 py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white text-sm rounded font-medium transition-colors">Evet, Sil</button>
                            <button onClick={() => setBulkDeleteConfirm(false)} className={`flex-1 py-1.5 px-3 text-sm rounded font-medium transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'}`}>İptal</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BulkActionsBar;
