import axiosClient from '../axiosClient';
import type {
  ApiResponse,
  SalonEstablishment,
  CreateSalonRequest,
  UpdateSalonRequest,
  OwnerAnalytics,
} from '../types';

// ─────────────────────────────────────────────────────────────
// Salon Establishment Endpoints
// Base route: /api/Establishment
// All endpoints require [Authorize] (Bearer token)
// ─────────────────────────────────────────────────────────────

const BASE = '/Establishment';

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
 * POST /api/Establishment/add
 * Creates a new salon establishment.
 * Sends FormData (includes picture file upload).
 */
export async function addSalon(
  payload: CreateSalonRequest,
): Promise<ApiResponse<{ id: string }>> {
  console.log('[apiEstablishment] addSalon: building FormData for payload', {
    name: payload.name,
    address: payload.address,
    uid: payload.uid,
    hasPicture: !!(payload.pictureFile && 'uri' in (payload.pictureFile as any) && (payload.pictureFile as any).uri),
  });
  const formData = buildSalonFormData(payload);
  console.log('[apiEstablishment] addSalon: sending POST to', `${BASE}/add`);
  const { data } = await axiosClient.post<ApiResponse<{ id: string }>>(
    `${BASE}/add`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  console.log('[apiEstablishment] addSalon: response =', JSON.stringify(data));
  return data;
}

/**
 * GET /api/Establishment/view
 * Without `id` → returns all salons.
 * With `id` → returns a single salon.
 */
export async function viewSalons(
  id?: string,
  uid?: string,
): Promise<ApiResponse<SalonEstablishment | SalonEstablishment[]>> {
  console.log('[apiEstablishment] viewSalons: sending GET, id =', id ?? '(all)', 'uid =', uid ?? '(all)');
  const { data } = await axiosClient.get<
    ApiResponse<SalonEstablishment | SalonEstablishment[]>
  >(`${BASE}/view`, {
    params: {
      ...(id ? { id } : {}),
      ...(uid ? { uid } : {}),
    },
  });
  console.log('[apiEstablishment] viewSalons: response =', JSON.stringify(data));
  return data;
}

/**
 * GET /api/Establishment/view?id=...
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
 * PUT /api/Establishment/update/:id
 * Updates salon establishment fields.
 * Sends FormData (optionally includes a new picture file).
 */
export async function updateSalon(
  id: string,
  payload: UpdateSalonRequest,
): Promise<ApiResponse<null>> {
  console.log('[apiEstablishment] updateSalon: building FormData for id =', id);
  const formData = buildSalonFormData(payload);
  console.log('[apiEstablishment] updateSalon: sending PUT to', `${BASE}/update/${id}`);
  const { data } = await axiosClient.put<ApiResponse<null>>(
    `${BASE}/update/${id}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  console.log('[apiEstablishment] updateSalon: response =', JSON.stringify(data));
  return data;
}

/**
 * DELETE /api/Establishment/delete/:id
 * Deletes a salon establishment by ID.
 */
export async function deleteSalon(
  id: string,
): Promise<ApiResponse<null>> {
  console.log('[apiEstablishment] deleteSalon: sending DELETE for id =', id);
  const { data } = await axiosClient.delete<ApiResponse<null>>(
    `${BASE}/delete/${id}`,
  );
  console.log('[apiEstablishment] deleteSalon: response =', JSON.stringify(data));
  return data;
}

/**
 * GET /api/Establishment/owner-analytics
 * Retrieves dashboard analytics for the salon owner.
 * If establishmentId is not provided, defaults to the owner's first salon.
 */
export async function getOwnerAnalytics(
  establishmentId?: string,
  filter?: 'monthly' | 'weekly',
): Promise<ApiResponse<OwnerAnalytics>> {
  console.log('[apiEstablishment] getOwnerAnalytics: sending GET with params', { establishmentId, filter });
  const { data } = await axiosClient.get<ApiResponse<OwnerAnalytics>>(
    `${BASE}/owner-analytics`,
    {
      params: {
        ...(establishmentId ? { establishmentId } : {}),
        ...(filter ? { filter } : {}),
      },
    },
  );
  return data;
}
