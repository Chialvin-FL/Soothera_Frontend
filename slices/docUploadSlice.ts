import { useState } from 'react';
import { fetchMyDocumentStatus, submitDocumentBatch } from '../service/docUploadService';

export function useDocUploadSlice() {
    const [isChecking, setIsChecking] = useState(false);
    const [requiresUpload, setRequiresUpload] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackTitle, setFeedbackTitle] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackVariant, setFeedbackVariant] = useState<'success' | 'error'>('success');

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
            } else if (res.statusCode === 404) {
                // Backend returns 404 if no documents exist for the user
                console.log('[docUploadSlice] No documents found (404), requiring upload.');
                setRequiresUpload(true);
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
            setFeedbackTitle('Upload Successful');
            setFeedbackMessage('Your documents have been uploaded and are now pending review.');
            setFeedbackVariant('success');
            setShowFeedback(true);
        } else {
            setError(res.message);
            setFeedbackTitle('Upload Failed');
            setFeedbackMessage(res.message || 'An error occurred while uploading your documents. Please try again.');
            setFeedbackVariant('error');
            setShowFeedback(true);
        }
        setIsUploading(false);
        return res.success;
    };

    const clearError = () => setError(null);
    const dismissFeedback = () => setShowFeedback(false);

    return {
        isChecking,
        requiresUpload,
        isUploading,
        error,
        showFeedback,
        feedbackTitle,
        feedbackMessage,
        feedbackVariant,
        clearError,
        dismissFeedback,
        checkDocuments,
        uploadDocs,
    };
}
