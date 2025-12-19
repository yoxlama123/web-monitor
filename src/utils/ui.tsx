import React from 'react';

export const getCategoryBadgeColor = (category: string | undefined, darkMode: boolean) => {
    if (!category || category === '-') return darkMode
        ? 'bg-gray-800 text-gray-400 border-gray-700'
        : 'bg-gray-100 text-gray-600 border-gray-200';

    const colors = [
        { light: 'bg-blue-100 text-blue-700 border-blue-200', dark: 'bg-blue-900/40 text-blue-300 border-blue-800' },
        { light: 'bg-purple-100 text-purple-700 border-purple-200', dark: 'bg-purple-900/40 text-purple-300 border-purple-800' },
        { light: 'bg-emerald-100 text-emerald-700 border-emerald-200', dark: 'bg-emerald-900/40 text-emerald-300 border-emerald-800' },
        { light: 'bg-amber-100 text-amber-700 border-amber-200', dark: 'bg-amber-900/40 text-amber-300 border-amber-800' },
        { light: 'bg-rose-100 text-rose-700 border-rose-200', dark: 'bg-rose-900/40 text-rose-300 border-rose-800' },
        { light: 'bg-indigo-100 text-indigo-700 border-indigo-200', dark: 'bg-indigo-900/40 text-indigo-300 border-indigo-800' },
        { light: 'bg-cyan-100 text-cyan-700 border-cyan-200', dark: 'bg-cyan-900/40 text-cyan-300 border-cyan-800' }
    ];

    let hash = 0;
    for (let i = 0; i < category.length; i++) {
        hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = colors[Math.abs(hash) % colors.length];
    return darkMode ? color.dark : color.light;
};

export const XIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);
