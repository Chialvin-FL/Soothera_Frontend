import axiosClient from '../axiosClient';
import type {
  ApiResponse,
  IdentityVerification,
  FaceVerifyResultData,
} from '../types';

// ─────────────────────────────────────────────────────────────
// Identity Verification Endpoints
// Base route: /api/IdVerification
// ─────────────────────────────────────────────────────────────

const BASE = '/IdVerification';

/**
 * POST /api/IdVerification/upload-id-and-selfie
 * Uploads both an ID photo and a selfie photo for face verification.
 * Only JPEG and PNG are allowed.
 * Policy: AdminOnly
 */
export async function uploadIdAndSelfie(
  idPhoto: File,
  selfiePhoto: File,
): Promise<ApiResponse<{ idUrl: string; selfieUrl: string }>> {
  const formData = new FormData();
  formData.append('idPhoto', idPhoto);
  formData.append('selfiePhoto', selfiePhoto);

  const { data } = await axiosClient.post<
    ApiResponse<{ idUrl: string; selfieUrl: string }>
  >(`${BASE}/upload-id-and-selfie`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/**
 * GET /api/IdVerification/get-id-verification
 * Retrieves the current user's identity verification details.
 * Policy: All
 */
export async function getIdVerification(): Promise<
  ApiResponse<IdentityVerification>
> {
  const { data } = await axiosClient.get<ApiResponse<IdentityVerification>>(
    `${BASE}/get-id-verification`,
  );
  return data;
}

/**
 * POST /api/IdVerification/verify-id
 * Triggers automatic face matching between the user's ID and selfie.
 * Policy: AdminOnly
 */
export async function verifyFaceMatch(): Promise<
  ApiResponse<FaceVerifyResultData>
> {
  const { data } = await axiosClient.post<ApiResponse<FaceVerifyResultData>>(
    `${BASE}/verify-id`,
  );
  return data;
}
