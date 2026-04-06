import { useState } from 'react';
import { fetchMyDocumentStatus, submitDocumentBatch } from '../service/docUploadService';

export function useDocUploadSlice() {
    const [isChecking, setIsChecking] = useState(false);
    const [requiresUpload, setRequiresUpload] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkDocuments = async () => {
        setIsChecking(true);
        setError(null);
        try {
            const res = await fetchMyDocumentStatus();
            if (res.success && res.data) {
                if (res.data.documentCount === 0) {
                    setRequiresUpload(true);
                } else {
                    setRequiresUpload(false);
                }
            } else {
                console.warn('Check documents failed', res.message);
            }
        } catch (e: any) {
            console.error('Check documents error', e);
        } finally {
            setIsChecking(false);
        }
    };

    const uploadDocs = async (files: any[]) => {
        setIsUploading(true);
        setError(null);
        const res = await submitDocumentBatch(files);
        if (res.success) {
            setRequiresUpload(false);
        } else {
            setError(res.message);
        }
        setIsUploading(false);
        return res.success;
    };

    const clearError = () => setError(null);

    return {
        isChecking,
        requiresUpload,
        isUploading,
        error,
        clearError,
        checkDocuments,
        uploadDocs,
    };
}
