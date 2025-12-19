import React from 'react';
import { Instagram } from 'lucide-react';
import { XIcon } from '../../utils/ui';

interface IconProps {
    className?: string;
}

const TikTokIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
);

const OnlyFansIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 400 400" fill="currentColor">
        <path d="M137.5,75a125,125,0,1,0,125,125A125,125,0,0,0,137.5,75Zm0,162.5A37.5,37.5,0,1,1,175,200,37.45,37.45,0,0,1,137.5,237.5Z" />
        <path d="M278,168.75c31.76,9.14,69.25,0,69.25,0-10.88,47.5-45.38,77.25-95.13,80.87A124.73,124.73,0,0,1,137.5,325L175,205.81C213.55,83.3,233.31,75,324.73,75H387.5C377,121.25,340.81,156.58,278,168.75Z" />
    </svg>
);

const FanslyIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 394.7 324.7" fill="currentColor">
        <path d="M231.9,95.6c1.5,1.5,2.7,2.9,4,4.2c30.6,30.6,61.3,61.2,91.9,91.9c4.9,4.9,4.9,5.9-0.1,10.9
	c-38.2,38.2-76.4,76.3-114.6,114.5c-10.3,10.3-20.6,10.3-30.9,0C130.7,265.5,78.8,214.5,27.9,162.4C0.3,134.2-6.9,99.8,6.6,62.8
	c13.1-36.1,40.1-57,78.3-61.9c31.2-4,58,6.1,80.3,28.3c6.6,6.6,13.1,13.3,19.8,19.7c3.4,3.3,3.2,6-0.1,9.2
	c-8.5,8.3-16.9,16.6-25.1,25.1c-3.4,3.5-6,3.2-9.2-0.2c-6.8-7.1-13.9-13.9-20.8-20.9c-18.7-18.6-48.6-18.5-67.3,0.2
	c-18.4,18.4-18.2,48.2,0.3,66.8c10.9,11,21.8,22,33.2,33.4c1.5-1.4,2.8-2.6,4-3.9C143,115.9,185.9,73,228.8,30.1
	c14.8-14.8,32-24.9,52.7-28.6c63.4-11.3,116.9,39.7,113,99.8c-1.6,24.1-10.9,44.7-27.6,61.9c-7,7.2-14.2,14.1-21.2,21.2
	c-3.1,3.1-5.8,3.3-8.9,0.1c-8.4-8.5-16.9-17-25.5-25.4c-3.1-3.1-3.3-5.7,0-8.8c7.1-6.8,14-13.8,20.9-20.8
	c18.8-19.1,19-48.6,0.5-67.4c-18.3-18.5-48.5-18.6-67.4,0C254.1,73.2,243.2,84.3,231.9,95.6z M150.3,196.5c0,26.5,21,48,47.1,48.1
	c25.9,0.2,47.8-21.6,47.9-47.6c0.1-26.1-21.4-47.3-47.9-47.3C171.2,149.7,150.3,170.5,150.3,196.5z" />
        <path d="M206.3,168.3c-2.7,5.4-1.7,10.4,2.7,14.4c4.7,4.2,10,4,15.1,0.4c7.8,10.8,3.6,27.7-5.1,35.9
	c-10.7,10.1-28.7,11.2-39.9,2.2c-12.1-9.7-15.4-26.3-7.8-39.4C178.4,169.2,193.8,163.2,206.3,168.3z" />
    </svg>
);

interface PlatformIconProps extends IconProps {
    platform: string;
}

export const PlatformIcon: React.FC<PlatformIconProps> = ({ platform, className }) => {
    switch (platform.toLowerCase()) {
        case 'instagram':
            return <Instagram className={className} />;
        case 'x':
        case 'twitter':
            return <XIcon className={className} />;
        case 'tiktok':
            return <TikTokIcon className={className} />;
        case 'onlyfans':
            return <OnlyFansIcon className={className} />;
        case 'fansly':
            return <FanslyIcon className={className} />;
        default:
            return <Instagram className={className} />;
    }
};

export { TikTokIcon, OnlyFansIcon, FanslyIcon };
