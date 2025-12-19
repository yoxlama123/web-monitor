import React, { useState } from 'react';
import { Home, LayoutGrid, User, Plus, Trash2, X } from 'lucide-react';

interface BottomNavigationProps {
    darkMode: boolean;
    onAddUrl: () => void;
    onRemoveUrl: () => void;
    currentPage: 'home' | 'list';
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
    darkMode,
    onAddUrl,
    onRemoveUrl,
    currentPage
}) => {
    const [showManagePopup, setShowManagePopup] = useState(false);

    const NavItem: React.FC<{
        icon: React.ReactNode;
        active?: boolean;
        disabled?: boolean;
        onClick?: () => void;
    }> = ({ icon, active, disabled, onClick }) => (
        <button
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            className={`
                flex items-center justify-center flex-1 py-2 transition-all duration-200
                ${disabled
                    ? 'opacity-40 cursor-not-allowed'
                    : active
                        ? (darkMode ? 'text-blue-400' : 'text-blue-600')
                        : (darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700')
                }
            `}
        >
            <div className={`
                p-2 rounded-xl transition-all duration-200
                ${active ? (darkMode ? 'bg-blue-500/20' : 'bg-blue-100') : ''}
            `}>
                {icon}
            </div>
        </button>
    );

    return (
        <>
            {/* Manage Popup Overlay */}
            {showManagePopup && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowManagePopup(false)}
                />
            )}

            {/* Manage Popup */}
            {showManagePopup && (
                <div className={`
                    fixed bottom-20 left-4 right-4 z-50 p-4 rounded-2xl shadow-2xl
                    transform transition-all duration-300 ease-out
                    ${darkMode ? 'bg-[#1E293B] border border-[#334155]' : 'bg-white border border-gray-200'}
                `}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Yönetim
                        </h3>
                        <button
                            onClick={() => setShowManagePopup(false)}
                            className={`p-1 rounded-full ${darkMode ? 'hover:bg-[#334155]' : 'hover:bg-gray-100'}`}
                        >
                            <X className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                onAddUrl();
                                setShowManagePopup(false);
                            }}
                            className={`
                                flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-200
                                ${darkMode
                                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                }
                            `}
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add URL</span>
                        </button>
                        <button
                            onClick={() => {
                                onRemoveUrl();
                                setShowManagePopup(false);
                            }}
                            className={`
                                flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-200
                                ${darkMode
                                    ? 'bg-transparent hover:bg-red-500/10 text-red-400 border border-red-500'
                                    : 'bg-transparent hover:bg-red-50 text-red-500 border border-red-500'
                                }
                            `}
                        >
                            <Trash2 className="w-5 h-5" />
                            <span>Remove URL</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Bottom Navigation Bar */}
            <nav className={`
                fixed bottom-0 left-0 right-0 z-30 
                flex items-center justify-around
                border-t backdrop-blur-lg
                pb-[env(safe-area-inset-bottom)]
                ${darkMode
                    ? 'bg-[#1E293B]/95 border-[#334155]'
                    : 'bg-white/95 border-gray-200'
                }
            `}>
                <NavItem
                    icon={<Home className="w-6 h-6" />}
                    active={currentPage === 'home' && !showManagePopup}
                    onClick={() => {
                        setShowManagePopup(false);
                    }}
                />
                <NavItem
                    icon={<LayoutGrid className="w-6 h-6" />}
                    active={showManagePopup}
                    onClick={() => setShowManagePopup(!showManagePopup)}
                />
                <NavItem
                    icon={<User className="w-6 h-6" />}
                    disabled={true}
                />
            </nav>
        </>
    );
};

export default BottomNavigation;
