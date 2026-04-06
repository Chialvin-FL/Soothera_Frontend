import {
  getIdVerification,
  uploadIdAndSelfie,
  verifyFaceMatch,
} from '../api/endpoints/apiIdVerification';

export const fetchIdVerificationStatus = async () => {
    try {
        const response = await getIdVerification();
        return response;
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to check identity verification status',
            statusCode: 500,
            data: null,
        };
    }
};

export const submitIdAndSelfie = async (idPhoto: any, selfiePhoto: any) => {
    try {
        const response = await uploadIdAndSelfie(idPhoto, selfiePhoto);
        return response;
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to upload identity documents',
            statusCode: 500,
            data: null,
        };
    }
};

export const triggerFaceMatch = async () => {
    try {
        const response = await verifyFaceMatch();
        return response;
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to verify face match',
            statusCode: 500,
            data: null,
        };
    }
};
