import React from 'react';

/**
 * Reusable loading spinner component
 */
/**
 * Reusable loading spinner component
 */
const LoadingSpinner = ({ darkMode, message = 'Yükleniyor...', size = 'md', fullPage = true, color = 'blue' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-4',
        lg: 'w-12 h-12 border-4'
    };

    const colorClasses = {
        blue: 'border-blue-500',
        white: 'border-white',
        gray: 'border-gray-500'
    };

    const containerClasses = fullPage
        ? 'flex items-center justify-center h-96'
        : 'flex items-center justify-center inline-flex';

    return (
        <div className={containerClasses}>
            <div className={`flex flex-col items-center ${fullPage ? 'gap-4' : 'gap-0'}`}>
                <div className={`${sizeClasses[size] || sizeClasses.md} ${colorClasses[color] || colorClasses.blue} border-t-transparent rounded-full animate-spin`}></div>
                {message && fullPage && (
                    <div className={darkMode ? 'text-[#94A3B8]' : 'text-gray-600'}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoadingSpinner;
