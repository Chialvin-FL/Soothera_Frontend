import axiosClient from '../axiosClient';
import type {
  ApiResponse,
  SalonEstablishment,
  CreateSalonRequest,
  UpdateSalonRequest,
} from '../types';

// ─────────────────────────────────────────────────────────────
// Salon Establishment Endpoints
// Base route: /api/SalonEstablishment
// All endpoints require [Authorize] (Bearer token)
// ─────────────────────────────────────────────────────────────

const BASE = '/SalonEstablishment';

/**
 * Builds a FormData object from the salon request payload.
 * Required because the backend expects [FromForm] with an IFormFile.
 */
function buildSalonFormData(
  payload: CreateSalonRequest | UpdateSalonRequest,
): FormData {
  const formData = new FormData();

  if ('name' in payload && payload.name != null) {
    formData.append('Name', payload.name);
  }
  if ('address' in payload && payload.address != null) {
    formData.append('Address', payload.address);
  }
  if ('socials' in payload && payload.socials != null) {
    payload.socials.forEach((s) => formData.append('Socials', s));
  }
  if ('pictureFile' in payload && payload.pictureFile != null) {
    const file = payload.pictureFile as any;
    if (file.uri) {
      // React Native ImagePicker asset: { uri, name, type }
      formData.append('PictureFile', {
        uri: file.uri,
        name: file.name ?? 'salon_image.jpg',
        type: file.type ?? 'image/jpeg',
      } as any);
    } else {
      // Web File object
      formData.append('PictureFile', file);
    }
  }
  if ('uid' in payload && payload.uid != null) {
    formData.append('UID', payload.uid);
  }
  if ('description' in payload && payload.description != null) {
    formData.append('Description', payload.description);
  }
  if ('contactNumber' in payload && payload.contactNumber != null) {
    formData.append('ContactNumber', payload.contactNumber);
  }
  if ('businessHours' in payload && payload.businessHours != null) {
    formData.append('BusinessHours', payload.businessHours);
  }

  return formData;
}

/**
 * POST /api/SalonEstablishment/add
 * Creates a new salon establishment.
 * Sends FormData (includes picture file upload).
 */
export async function addSalon(
  payload: CreateSalonRequest,
): Promise<ApiResponse<{ id: string }>> {
  const formData = buildSalonFormData(payload);
  const { data } = await axiosClient.post<ApiResponse<{ id: string }>>(
    `${BASE}/add`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
}

/**
 * GET /api/SalonEstablishment/view
 * Without `id` → returns all salons.
 * With `id` → returns a single salon.
 */
export async function viewSalons(
  id?: string,
): Promise<ApiResponse<SalonEstablishment | SalonEstablishment[]>> {
  const { data } = await axiosClient.get<
    ApiResponse<SalonEstablishment | SalonEstablishment[]>
  >(`${BASE}/view`, {
    params: id ? { id } : undefined,
  });
  return data;
}

/**
 * GET /api/SalonEstablishment/view?id=...
 * Convenience wrapper that returns a single salon.
 */
export async function getSalonById(
  id: string,
): Promise<ApiResponse<SalonEstablishment>> {
  const { data } = await axiosClient.get<ApiResponse<SalonEstablishment>>(
    `${BASE}/view`,
    { params: { id } },
  );
  return data;
}

/**
 * PUT /api/SalonEstablishment/update/:id
 * Updates salon establishment fields.
 * Sends FormData (optionally includes a new picture file).
 */
export async function updateSalon(
  id: string,
  payload: UpdateSalonRequest,
): Promise<ApiResponse<null>> {
  const formData = buildSalonFormData(payload);
  const { data } = await axiosClient.put<ApiResponse<null>>(
    `${BASE}/update/${id}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
}

/**
 * DELETE /api/SalonEstablishment/delete/:id
 * Deletes a salon establishment by ID.
 */
export async function deleteSalon(
  id: string,
): Promise<ApiResponse<null>> {
  const { data } = await axiosClient.delete<ApiResponse<null>>(
    `${BASE}/delete/${id}`,
  );
  return data;
}
