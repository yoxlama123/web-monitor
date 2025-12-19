import React, { useState, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';
import { Instagram } from 'lucide-react';
import { truncateText } from '../utils/text';
import { formatTimeAgo } from '../utils/date';
import { ANIMATION_DELAYS, TEXT_LIMITS } from '@/constants';
import { Post } from '../types/post';
import { XIcon } from '../utils/ui';

interface PostCardProps {
    post: Post & { profile_name?: string; __sort_date?: string; post_video?: string; post_image?: string; post_text?: string; url?: string };
    index: number;
    darkMode: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, index, darkMode }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(false);
        const timer = setTimeout(() => setIsVisible(true), index * ANIMATION_DELAYS.CARD_STAGGER);
        return () => clearTimeout(timer);
    }, [index, post]);

    return (
        <div className={`rounded-2xl shadow-lg overflow-hidden transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${darkMode ? 'bg-[#1E293B]' : 'bg-white'} w-[468px] max-w-full`}>
            {/* Header with padding */}
            <div className="p-5 pb-0">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <a href={post.profile_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            <img src={post.profile_image} alt={post.profile_name} className="w-12 h-12 rounded-full object-cover hover:opacity-80 transition-opacity cursor-pointer" />
                        </a>
                        <div className="min-w-0">
                            <a href={post.profile_url} target="_blank" rel="noopener noreferrer" className={`font-bold text-base block truncate transition-colors ${darkMode ? 'text-[#E2E8F0] hover:text-white' : 'text-black hover:text-gray-700'}`} onClick={(e) => e.stopPropagation()} style={{ textDecoration: 'none' }}>
                                {post.profile_name}
                            </a>
                            <p className={`text-xs ${darkMode ? 'text-[#94A3B8]' : 'text-gray-400'}`}>{formatTimeAgo(post.__sort_date)}</p>
                        </div>
                    </div>
                    <div className={darkMode ? 'text-[#E2E8F0]' : 'text-gray-800'}>
                        {(post.platform || '').toLowerCase() === 'instagram' ? (
                            <Instagram className="w-6 h-6 flex-shrink-0" />
                        ) : (
                            <XIcon className="w-6 h-6 flex-shrink-0" />
                        )}
                    </div>
                </div>
            </div>

            {/* Media (Video or Image) - full width */}
            {post.post_video ? (
                <VideoPlayer src={post.post_video} poster={post.post_image} />
            ) : post.post_image && (
                <a href={post.url} target="_blank" rel="noopener noreferrer" className="block">
                    <img src={post.post_image} alt="Post" className="w-full h-auto object-contain hover:opacity-95 transition-opacity" style={{ maxHeight: '621px' }} />
                </a>
            )}

            {/* Text with padding */}
            {post.post_text && (
                <div className="px-5 pb-5 pt-4">
                    <a href={post.url} target="_blank" rel="noopener noreferrer" className={`inline-block text-sm leading-relaxed ${darkMode ? 'text-[#E2E8F0]' : 'text-black'}`} style={{ wordBreak: 'break-word', textDecoration: 'none', pointerEvents: post.post_image ? 'none' : 'auto' }}>
                        {truncateText(post.post_text, post.post_image ? TEXT_LIMITS.POST_WITH_IMAGE : TEXT_LIMITS.POST_WITHOUT_IMAGE)}
                    </a>
                </div>
            )}
        </div>
    );
};

export default PostCard;
