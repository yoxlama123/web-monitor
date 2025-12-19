import { useState } from 'react';
import { PLATFORMS } from '@/constants';
import { Connection } from '../types';

export interface FormData {
    url: string;
    category: string;
    platform: string;
    connections: Connection[];
}

export const useModalState = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [type, setType] = useState<'add' | 'remove' | null>(null);
    const [formData, setFormData] = useState<FormData>({
        url: '',
        category: '',
        platform: PLATFORMS.INSTAGRAM,
        connections: []
    });
    const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false);
    const [connectionDropdownOpen, setConnectionDropdownOpen] = useState<number | null>(null);

    const openModal = (modalType: 'add' | 'remove') => {
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

    const closeModal = () => {
        setIsOpen(false);
        setType(null);
        setIsPlatformDropdownOpen(false);
        setConnectionDropdownOpen(null);
    };

    const updateField = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateFields = (updates: Partial<FormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const togglePlatformDropdown = () => {
        setIsPlatformDropdownOpen(prev => !prev);
    };

    const selectPlatform = (platform: string) => {
        updateField('platform', platform);
        setIsPlatformDropdownOpen(false);
    };

    const addConnection = () => {
        setFormData(prev => ({
            ...prev,
            connections: [...prev.connections, { platform: PLATFORMS.INSTAGRAM, url: '' }]
        }));
    };

    const removeConnection = (index: number) => {
        setFormData(prev => ({
            ...prev,
            connections: prev.connections.filter((_, i) => i !== index)
        }));
    };

    const updateConnection = (index: number, field: keyof Connection, value: string) => {
        setFormData(prev => ({
            ...prev,
            connections: prev.connections.map((conn, i) =>
                i === index ? { ...conn, [field]: value } : conn
            )
        }));
    };

    const toggleConnectionDropdown = (index: number) => {
        setConnectionDropdownOpen(prev => prev === index ? null : index);
    };

    const selectConnectionPlatform = (index: number, platform: string) => {
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
