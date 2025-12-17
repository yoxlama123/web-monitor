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
        platform: PLATFORMS.INSTAGRAM,
        connections: []
    });
    const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false);
    const [connectionDropdownOpen, setConnectionDropdownOpen] = useState(null); // index of open dropdown

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
            platform: PLATFORMS.INSTAGRAM,
            connections: []
        });
        setIsPlatformDropdownOpen(false);
        setConnectionDropdownOpen(null);
    };

    /**
     * Close modal and reset state
     */
    const closeModal = () => {
        setIsOpen(false);
        setType(null);
        setIsPlatformDropdownOpen(false);
        setConnectionDropdownOpen(null);
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

    const addConnection = () => {
        setFormData(prev => ({
            ...prev,
            connections: [...prev.connections, { platform: PLATFORMS.INSTAGRAM, url: '' }]
        }));
    };

    const removeConnection = (index) => {
        setFormData(prev => ({
            ...prev,
            connections: prev.connections.filter((_, i) => i !== index)
        }));
    };

    const updateConnection = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            connections: prev.connections.map((conn, i) =>
                i === index ? { ...conn, [field]: value } : conn
            )
        }));
    };

    const toggleConnectionDropdown = (index) => {
        setConnectionDropdownOpen(prev => prev === index ? null : index);
    };

    const selectConnectionPlatform = (index, platform) => {
        updateConnection(index, 'platform', platform);
        setConnectionDropdownOpen(null);
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
        selectPlatform,
        connectionDropdownOpen,
        addConnection,
        removeConnection,
        updateConnection,
        toggleConnectionDropdown,
        selectConnectionPlatform
    };
};
