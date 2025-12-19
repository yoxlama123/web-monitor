import React from 'react';
import { Instagram, LayoutGrid, Globe, Plus, Trash2, List, LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { XIcon } from '../utils/ui';
import BottomNavigation from './BottomNavigation';

interface LayoutProps {
    children: React.ReactNode;
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
    filter: string;
    setFilter: (value: string) => void;
    counts: {
        all: number;
        instagram: number;
        x: number;
    };
    onAddUrl: () => void;
    onRemoveUrl: () => void;
    currentPage?: 'home' | 'list';
}

const Layout: React.FC<LayoutProps> = ({
    children,
    darkMode,
    setDarkMode,
    filter,
    setFilter,
    counts,
    onAddUrl,
    onRemoveUrl,
    currentPage = 'home'
}) => {
    const navigate = useNavigate();

    const FilterButton: React.FC<{ id: string; label: string; icon: LucideIcon | React.FC<{ className?: string }>; count: number }> = ({ id, label, icon: Icon, count }) => (
        <button
            onClick={() => setFilter(id)}
            className={`
        w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
        ${filter === id
                    ? (darkMode ? 'bg-[#334155] text-white shadow-lg' : 'bg-white text-black shadow-md')
                    : (darkMode ? 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#E2E8F0]' : 'text-gray-500 hover:bg-white hover:text-gray-900')
                }
      `}
        >
            <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${filter === id ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} />
                <span className="font-medium">{label}</span>
            </div>
            <span className={`
        text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center
        ${filter === id
                    ? (darkMode ? 'bg-[#0F172A] text-white' : 'bg-gray-100 text-black')
                    : (darkMode ? 'bg-[#1E293B] text-[#94A3B8]' : 'bg-gray-200 text-gray-600')
                }
      `}>
                {count}
            </span>
        </button>
    );

    const ActionButton: React.FC<{ label: string; icon: LucideIcon; onClick: () => void; disabled?: boolean; variant?: 'default' | 'danger' }> = ({ label, icon: Icon, onClick, disabled, variant = 'default' }) => {
        const baseClasses = "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm";
        const variants = {
            default: darkMode
                ? "text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#E2E8F0]"
                : "text-gray-500 hover:bg-white hover:text-gray-900",
            danger: darkMode
                ? "text-red-400 hover:bg-red-900/20 hover:text-red-300"
                : "text-red-500 hover:bg-red-50 hover:text-red-600",
            disabled: "opacity-50 cursor-not-allowed " + (darkMode ? "text-gray-600" : "text-gray-400")
        };

        return (
            <button
                onClick={onClick}
                disabled={disabled}
                className={`${baseClasses} ${disabled ? variants.disabled : (variant === 'danger' ? variants.danger : variants.default)}`}
            >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
            </button>
        );
    };

    const rootClasses = darkMode
        ? 'min-h-screen bg-[#0F172A]'
        : 'min-h-screen bg-[#e8e8e8]';

    return (
        <div className={rootClasses}>
            <header
                className={darkMode ? 'bg-[#1E293B] shadow-sm' : 'bg-white shadow-sm'}
                style={{ transition: 'background-color 0.3s' }}
            >
                <div className="max-w-6xl mx-auto flex items-center justify-between px-8 py-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-black"></div>
                        <h1 className={darkMode ? 'text-[#E2E8F0] text-3xl font-bold' : 'text-black text-3xl font-bold'}>
                            Monitoring
                        </h1>
                    </div>
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${darkMode ? 'bg-[#334155]' : 'bg-gray-200'}`}
                    >
                        <div className={`absolute top-1 w-6 h-6 rounded-full shadow-md transition-all duration-300 flex items-center justify-center text-sm font-medium text-black ${darkMode ? 'translate-x-8 bg-[#1E293B]' : 'translate-x-0 bg-white'}`}>
                            {darkMode ? '🌙' : '☀️'}
                        </div>
                    </button>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
                {/* Left Sidebar - Hidden on mobile */}
                <aside className={`hidden md:block lg:w-72 flex-shrink-0 border-r ${darkMode ? 'bg-[#1E293B]/30 border-[#334155]' : 'bg-white/50 border-gray-200'}`}>
                    <div className="sticky top-0 p-6 space-y-8">
                        <div>
                            <div className="flex items-center gap-3 px-2 mb-6">
                                <Globe className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-black'}`} />
                                <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-black'}`}>Platformlar</h2>
                            </div>
                            <div className={`space-y-2 pb-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                <FilterButton id="all" label="Tümü" icon={LayoutGrid} count={counts.all} />
                                <FilterButton id="Instagram" label="Instagram" icon={Instagram} count={counts.instagram} />
                                <FilterButton id="X" label="X" icon={XIcon} count={counts.x} />
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content - Add bottom padding on mobile for bottom nav */}
                <main className="flex-1 min-w-0 py-8 px-4 pb-24 md:pb-8">
                    {children}
                </main>

                {/* Right Sidebar - Hidden on mobile */}
                <aside className={`hidden md:block lg:w-72 flex-shrink-0 border-l ${darkMode ? 'bg-[#1E293B]/30 border-[#334155]' : 'bg-white/50 border-gray-200'}`}>
                    <div className="sticky top-0 p-6 space-y-8">
                        <div>
                            <h2 className={`px-2 text-lg font-bold mb-6 ${darkMode ? 'text-white' : 'text-black'}`}>Yönetim</h2>
                            <div className={`space-y-2 pb-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                <ActionButton label="Add Url" icon={Plus} onClick={onAddUrl} />
                                <ActionButton label="Remove Url" icon={Trash2} variant="danger" onClick={onRemoveUrl} />
                                <ActionButton
                                    label={currentPage === 'home' ? 'List Url' : 'Ana Sayfa'}
                                    icon={List}
                                    onClick={() => navigate(currentPage === 'home' ? '/list-profiles' : '/')}
                                />
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Bottom Navigation - Only visible on mobile */}
            <div className="md:hidden">
                <BottomNavigation
                    darkMode={darkMode}
                    onAddUrl={onAddUrl}
                    onRemoveUrl={onRemoveUrl}
                    currentPage={currentPage}
                />
            </div>
        </div>
    );
};

export default Layout;
