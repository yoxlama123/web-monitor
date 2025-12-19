import { useState } from 'react';

export const useWebhook = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const sendCommand = async (action: string, data: any = {}) => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const webhookUrl = import.meta.env.VITE_COMMAND_WEBHOOK_URL || import.meta.env.VITE_WEBHOOK_URL;

            if (!webhookUrl) {
                throw new Error('Webhook URL tanımlanmamış. Lütfen .env dosyasını kontrol edin.');
            }

            const payload = {
                action,
                ...data
            };

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'İşlem başarısız oldu.');
            }

            setSuccess(responseData.message || 'İşlem başarılı');
            return responseData;

        } catch (err: any) {
            console.error('Webhook Error:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setLoading(false);
        setError(null);
        setSuccess(null);
    };

    return {
        loading,
        error,
        success,
        sendCommand,
        reset
    };
};
