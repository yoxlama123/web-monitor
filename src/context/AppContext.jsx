import { createContext, useContext, useState } from 'react';

/**
 * App Context for global state management
 */
const AppContext = createContext(undefined);

/**
 * App Provider component
 */
export const AppProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(true);
    const [filter, setFilter] = useState('all');
    const [isGlobalMuted, setIsGlobalMuted] = useState(true);

    const value = {
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
 * @returns {object} Context value
 */
export const useApp = () => {
    const context = useContext(AppContext);

    if (context === undefined) {
        throw new Error('useApp must be used within AppProvider');
    }

    return context;
};
