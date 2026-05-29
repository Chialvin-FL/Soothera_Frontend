import { useState } from 'react';
import {
    fetchIdVerificationStatus,
    submitIdAndSelfie,
    triggerFaceMatch,
} from '../service/idVerificationService';
import { VerificationStatus, IdentityVerification } from '../api/types';

export function useIdVerificationSlice() {
    const [isChecking, setIsChecking] = useState(false);
    const [requiresVerification, setRequiresVerification] = useState(false);
    const [existingVerification, setExistingVerification] = useState<IdentityVerification | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const checkVerification = async () => {
        setIsChecking(true);
        setError(null);
        try {
            const res = await fetchIdVerificationStatus();
            if (res.success && res.data) {
                setExistingVerification(res.data);
                const isPassed = Number(res.data.verifyStatus) === VerificationStatus.Passed || res.data.statusName === 'Passed';
                if (!isPassed) {
                    setRequiresVerification(true);
                } else {
                    setRequiresVerification(false);
                }
            } else {
                // If it fails (e.g., 404 not found or not uploaded yet), require verification
                setExistingVerification(null);
                setRequiresVerification(true);
            }
        } catch (e: any) {
            console.error('Check verification error', e);
            setExistingVerification(null);
            setRequiresVerification(true);
        } finally {
            setIsChecking(false);
        }
    };

    const uploadAndVerify = async (idPhoto: any, selfiePhoto: any) => {
        setIsUploading(true);
        setError(null);
        setSuccessMessage(null);

        // Step 1: Upload ID and Selfie
        const uploadRes = await submitIdAndSelfie(idPhoto, selfiePhoto);
        if (!uploadRes.success) {
            setError(uploadRes.message || 'Failed to upload identity documents.');
            setIsUploading(false);
            return false;
        }

        setIsUploading(false);
        setIsVerifying(true);

        // Step 2: Verify Face Match
        const verifyRes = await triggerFaceMatch();
        if (!verifyRes.success) {
            setError(verifyRes.message || 'Failed to verify face match.');
            setIsVerifying(false);
            return false;
        }

        const isPassed = Number(verifyRes.data?.verifyStatus) === VerificationStatus.Passed || verifyRes.data?.statusName === 'Passed';
        if (isPassed) {
            const confidenceVal = verifyRes.data?.confidence;
            const confidenceStr = confidenceVal !== undefined && confidenceVal !== null
                ? `\n\nSelfie Matches ID by ${Math.round(confidenceVal)}%`
                : '';

            setSuccessMessage(`Upload & Verification Successful!${confidenceStr}`);
            setIsVerifying(false);
            return true;
        } else {
            setError(verifyRes.message || 'Face Verification did not pass.');
            setIsVerifying(false);
            return false;
        }
    };

    const clearError = () => setError(null);

    const acknowledgeSuccess = async () => {
        setRequiresVerification(false);
        setSuccessMessage(null);
        // Refresh verification status from API to update state
        await checkVerification();
    };

    return {
        isChecking,
        requiresVerification,
        existingVerification,
        isUploading,
        isVerifying,
        error,
        successMessage,
        clearError,
        acknowledgeSuccess,
        checkVerification,
        uploadAndVerify,
    };
}

