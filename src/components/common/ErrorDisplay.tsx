import React from 'react';

interface ErrorDisplayProps {
    darkMode: boolean;
    error: string;
    onRetry?: () => void;
}

/**
 * Reusable error display component
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ darkMode, error, onRetry }) => {
    return (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
            <div className={darkMode ? 'text-red-400 text-lg' : 'text-red-600 text-lg'}>
                ⚠️ {error}
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${darkMode
                        ? 'bg-[#334155] text-[#E2E8F0] hover:bg-[#475569]'
                        : 'bg-gray-200 text-black hover:bg-gray-300'
                        }`}
                >
                    Tekrar Dene
                </button>
            )}
        </div>
    );
};

export default ErrorDisplay;
