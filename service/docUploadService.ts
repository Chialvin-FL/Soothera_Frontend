import { batchUploadDocuments, checkMyDocuments } from '../api/endpoints/apiDocumentUpload';

export async function submitDocumentBatch(files: any[]) {
    try {
        const result = await batchUploadDocuments(files as File[]);
        return result;
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || error?.response?.data?.message || 'Error uploading documents.',
            statusCode: error?.statusCode || error?.response?.status || 500,
            data: null,
        };
    }
}

export async function fetchMyDocumentStatus() {
    try {
        const result = await checkMyDocuments();
        return result;
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || error?.response?.data?.message || 'Error fetching document status.',
            statusCode: error?.statusCode || error?.response?.status || 500,
            data: null,
        };
    }
}
