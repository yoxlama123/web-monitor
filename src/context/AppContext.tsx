import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
    filter: string;
    setFilter: (value: string) => void;
    isGlobalMuted: boolean;
    setIsGlobalMuted: (value: boolean) => void;
}

/**
 * App Context for global state management
 */
const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * App Provider component
 */
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [darkMode, setDarkMode] = useState(true);
    const [filter, setFilter] = useState('all');
    const [isGlobalMuted, setIsGlobalMuted] = useState(true);

    const value: AppContextType = {
        darkMode,
        setDarkMode,
        filter,
        setFilter,
        isGlobalMuted,
        setIsGlobalMuted
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

/**
 * Custom hook to use App context
 * @returns {AppContextType} Context value
 */
export const useApp = () => {
    const context = useContext(AppContext);

    if (context === undefined) {
        throw new Error('useApp must be used within AppProvider');
    }

    return context;
};
