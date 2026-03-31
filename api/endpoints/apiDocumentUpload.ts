import axiosClient from '../axiosClient';
import type {
  ApiResponse,
  UserDocument,
  DocumentStatusRequest,
  GetUserDocsParams,
  CheckMyDocsData,
} from '../types';

// ─────────────────────────────────────────────────────────────
// Document Upload Endpoints
// Base route: /api/DocumentUpload
// ─────────────────────────────────────────────────────────────

const BASE = '/DocumentUpload';

/**
 * POST /api/DocumentUpload/batch-upload
 * Uploads multiple documents as form files.
 * Allowed types: JPEG, PNG, PDF.
 * Policy: LenderBorrower
 */
export async function batchUploadDocuments(
  files: File[],
): Promise<ApiResponse<{ documents: string[] }>> {
  const formData = new FormData();
  files.forEach((file) => formData.append('documents', file));

  const { data } = await axiosClient.post<
    ApiResponse<{ documents: string[] }>
  >(`${BASE}/batch-upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/**
 * GET /api/DocumentUpload/get-user-docs
 * Retrieves documents with optional filters.
 * Policy: AdminOnly
 */
export async function getUserDocuments(
  params?: GetUserDocsParams,
): Promise<ApiResponse<UserDocument[]>> {
  const { data } = await axiosClient.get<ApiResponse<UserDocument[]>>(
    `${BASE}/get-user-docs`,
    { params },
  );
  return data;
}

/**
 * POST /api/DocumentUpload/update-doc-status
 * Admin verifies or rejects a user's documents.
 * Policy: AdminOnly
 */
export async function updateDocumentStatus(
  payload: DocumentStatusRequest,
): Promise<ApiResponse<null>> {
  const { data } = await axiosClient.post<ApiResponse<null>>(
    `${BASE}/update-doc-status`,
    payload,
  );
  return data;
}

/**
 * GET /api/DocumentUpload/check-my-docs
 * Checks if the current user has uploaded documents.
 * Policy: LenderBorrower
 */
export async function checkMyDocuments(): Promise<
  ApiResponse<CheckMyDocsData>
> {
  const { data } = await axiosClient.get<ApiResponse<CheckMyDocsData>>(
    `${BASE}/check-my-docs`,
  );
  return data;
}
