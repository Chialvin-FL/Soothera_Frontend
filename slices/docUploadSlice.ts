import { useState } from 'react';
import { fetchMyDocumentStatus, submitDocumentBatch } from '../service/docUploadService';
import { CheckMyDocsData, DocumentStatus } from '../api/types';

export function useDocUploadSlice() {
    const [isChecking, setIsChecking] = useState(false);
    const [requiresUpload, setRequiresUpload] = useState(false);
    const [existingDocs, setExistingDocs] = useState<CheckMyDocsData | null>(null);
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
                setExistingDocs(res.data);
                const documentCount = res.data.documentCount ?? 0;
                const status = Number(res.data.status);
                
                // Require upload if no documents exist or if previous documents were Rejected (status === 2)
                if (documentCount === 0 || status === DocumentStatus.Rejected) {
                    setRequiresUpload(true);
                } else {
                    setRequiresUpload(false);
                }
            } else if (res.statusCode === 404) {
                // Backend returns 404 if no documents exist for the user
                console.log('[docUploadSlice] No documents found (404), requiring upload.');
                setExistingDocs(null);
                setRequiresUpload(true);
            } else {
                console.warn('Check documents failed', res.message);
                setExistingDocs(null);
            }
        } catch (e: any) {
            console.error('Check documents error', e);
            setExistingDocs(null);
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
            // Refresh document status from API
            await checkDocuments();
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
        existingDocs,
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

