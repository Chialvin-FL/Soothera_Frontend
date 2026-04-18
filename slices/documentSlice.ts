import { useState, useCallback } from 'react';
import { documentService } from '../service/documentService';
import type { UserDocument, DocumentStatus } from '../api/types';

/**
 * Hook for managing document verification state in the Super Admin dashboard.
 */
export const useDocumentSlice = () => {
    const [documents, setDocuments] = useState<UserDocument[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadPending = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await documentService.getPendingApprovals();
            setDocuments(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load verifications');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const verifyDocs = useCallback(async (uid: string, status: DocumentStatus, remarks: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const success = await documentService.verifyDocuments(uid, status, remarks);
            if (success) {
                // Remove from local list after successful verification
                setDocuments(prev => prev.filter(doc => doc.uid !== uid));
            }
            return success;
        } catch (err: any) {
            setError(err.message || 'Action failed');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearError = () => setError(null);

    return {
        documents,
        isLoading,
        error,
        loadPending,
        verifyDocs,
        clearError
    };
};
