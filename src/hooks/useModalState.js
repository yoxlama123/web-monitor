import { useState } from 'react';
import { PLATFORMS } from '../constants';

/**
 * Custom hook for modal state management
 * Handles modal open/close, form data, and platform dropdown
 */
export const useModalState = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [type, setType] = useState(null); // 'add' or 'remove'
    const [formData, setFormData] = useState({
        url: '',
        category: '',
        platform: PLATFORMS.INSTAGRAM
    });
    const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false);

    /**
     * Open modal with specified type
     * @param {string} modalType - 'add' or 'remove'
     */
    const openModal = (modalType) => {
        setType(modalType);
        setIsOpen(true);
        setFormData({
            url: '',
            category: '',
            platform: PLATFORMS.INSTAGRAM
        });
        setIsPlatformDropdownOpen(false);
    };

    /**
     * Close modal and reset state
     */
    const closeModal = () => {
        setIsOpen(false);
        setType(null);
        setIsPlatformDropdownOpen(false);
    };

    /**
     * Update form field
     * @param {string} field - Field name
     * @param {any} value - Field value
     */
    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    /**
     * Update multiple fields at once
     * @param {object} updates - Object with field updates
     */
    const updateFields = (updates) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    /**
     * Toggle platform dropdown
     */
    const togglePlatformDropdown = () => {
        setIsPlatformDropdownOpen(prev => !prev);
    };

    /**
     * Set platform and close dropdown
     * @param {string} platform - Platform name
     */
    const selectPlatform = (platform) => {
        updateField('platform', platform);
        setIsPlatformDropdownOpen(false);
    };

    return {
        isOpen,
        type,
        formData,
        isPlatformDropdownOpen,
        openModal,
        closeModal,
        updateField,
        updateFields,
        togglePlatformDropdown,
        selectPlatform
    };
};
