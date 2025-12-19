import React from 'react';
import { Instagram, Edit2, Trash2 } from 'lucide-react';
import { Profile, Connection } from '../../types';
import { extractProfileName } from '../../utils/url';
import { formatDate } from '../../utils/date';
import { PlatformIcon } from '../icons/PlatformIcons';
import { getCategoryBadgeColor, XIcon } from '../../utils/ui';

interface ProfileCardProps {
    profile: Profile;
    darkMode: boolean;
    isSelected: boolean;
    onToggleSelection: (id: string) => void;
    onEdit: (profile: Profile) => void;
    onDelete: (profile: Profile) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
    profile,
    darkMode,
    isSelected,
    onToggleSelection,
    onEdit,
    onDelete
}) => {
    const profileName = extractProfileName(profile.profile_url);
    const platform = (profile.platform || '').toLowerCase();

    return (
        <div className={`rounded-2xl shadow-lg overflow-hidden transition-all duration-200 ${darkMode ? 'bg-[#1E293B] hover:bg-[#334155]' : 'bg-white hover:bg-gray-50'}`}>
            <div className="p-5">
                <div className="flex items-start gap-4">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelection(profile.id)}
                        className="w-5 h-5 rounded cursor-pointer flex-shrink-0 self-center"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex flex-col items-center gap-3 flex-shrink-0">
                        <a href={profile.profile_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                            <img
                                src={profile.profile_image || '/default-avatar.png'}
                                alt={profileName}
                                className="w-20 h-20 rounded-full object-cover hover:opacity-80 transition-opacity cursor-pointer border-2 border-gray-300"
                                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="24" fill="%23999"%3E?%3C/text%3E%3C/svg%3E';
                                }}
                            />
                        </a>

                        {profile.connections && profile.connections.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap justify-center max-w-[100px]">
                                {profile.connections.map((conn: Connection, i: number) => (
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
                                {platform === 'instagram' ? <Instagram className="w-5 h-5" /> : <XIcon className="w-5 h-5" />}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                                <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Kategori:</span>{' '}
                                {profile.category ? (
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getCategoryBadgeColor(profile.category, darkMode)}`}>
                                        {profile.category}
                                    </span>
                                ) : (
                                    <span className={darkMode ? 'text-gray-300' : 'text-gray-900'}>-</span>
                                )}
                            </div>
                            <div>
                                <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Eklenme:</span>{' '}
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-900'}>{formatDate(profile.createdAt)}</span>
                            </div>
                            <div>
                                <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>RSS Feed:</span>{' '}
                                <a href={profile.rss_feed} target="_blank" rel="noopener noreferrer" className={`hover:underline ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Link</a>
                            </div>
                            <div>
                                <span className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Son Kontrol:</span>{' '}
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-900'}>{formatDate(profile.last_check)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4 self-center">
                        <button
                            onClick={() => onEdit(profile)}
                            className={`p-2 rounded-lg transition-all ${darkMode ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/40' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                            title="Düzenle"
                        >
                            <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => onDelete(profile)}
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
};

export default ProfileCard;
