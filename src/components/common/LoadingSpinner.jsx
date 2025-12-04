import React from 'react';

/**
 * Reusable loading spinner component
 */
const LoadingSpinner = ({ darkMode, message = 'Yükleniyor...' }) => {
    return (
        <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <div className={darkMode ? 'text-[#94A3B8]' : 'text-gray-600'}>
                    {message}
                </div>
            </div>
        </div>
    );
};

export default LoadingSpinner;
