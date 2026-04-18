import { getUserDocuments, updateDocumentStatus } from '../api/endpoints/apiDocumentUpload';
import type { UserDocument, DocumentStatus } from '../api/types';

/**
 * Service for handling Super Admin Document Verifications
 */
export const documentService = {
  /**
   * Fetches all documents pending for approval (Status 0).
   */
  async getPendingApprovals(): Promise<UserDocument[]> {
    try {
      // 0 = Pending
      const response = await getUserDocuments({ status: 0 });
      if (response.success) {
        return response.data || [];
      }
      throw new Error(response.message || 'Failed to fetch pending approvals');
    } catch (error: any) {
      console.error('[documentService] getPendingApprovals Error:', error);
      throw error;
    }
  },

  /**
   * Updates the status of a user's documents.
   * @param uid The UID of the user whose documents are being verified
   * @param status The new status (1 = Verified, 2 = Rejected)
   * @param remarks Feedback message from the Super Admin
   */
  async verifyDocuments(uid: string, status: DocumentStatus, remarks: string): Promise<boolean> {
    try {
      const response = await updateDocumentStatus({
        uid,
        status,
        remarks,
      });
      return response.success;
    } catch (error: any) {
      console.error('[documentService] verifyDocuments Error:', error);
      throw error;
    }
  },
};
