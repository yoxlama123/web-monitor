import React from 'react';

/**
 * Reusable form input component
 */
const FormInput = ({
    label,
    value,
    onChange,
    placeholder,
    darkMode,
    type = 'text',
    ...props
}) => {
    return (
        <div>
            <label
                className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
            >
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${darkMode
                        ? 'bg-[#0F172A] border-[#334155] text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-black'
                    }`}
                {...props}
            />
        </div>
    );
};

export default FormInput;
