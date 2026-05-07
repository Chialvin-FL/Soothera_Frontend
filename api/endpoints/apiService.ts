import axiosClient from '../axiosClient';
import type {
    ApiResponse,
    PaginatedResponse,
    SalonServiceResponse,
    CreateSalonServiceRequest,
    UpdateSalonServiceRequest,
    GetSalonServicesParams,
} from '../types';

// ─────────────────────────────────────────────────────────────
// Salon Service Endpoints
// Base route: /api/SalonService
// ─────────────────────────────────────────────────────────────

const BASE = '/SalonService';

/**
 * Appends array values to FormData with the correct repeated-key pattern
 * that ASP.NET Core model binding expects for List<T>.
 */
function appendArray<T extends string | number>(
    formData: FormData,
    key: string,
    values: T[],
): void {
    values.forEach((v) => formData.append(key, String(v)));
}

/**
 * Builds a FormData object for create/update salon service requests.
 * Mirrors CreateSalonServiceDTO / UpdateSalonServiceDTO [FromForm] binding.
 */
function buildServiceFormData(
    payload: CreateSalonServiceRequest | UpdateSalonServiceRequest,
): FormData {
    const formData = new FormData();

    if ('templateServiceId' in payload && payload.templateServiceId != null) {
        formData.append('TemplateServiceId', payload.templateServiceId);
    }
    if (payload.serviceName != null) {
        formData.append('ServiceName', payload.serviceName);
    }
    if (payload.description != null) {
        formData.append('Description', payload.description);
    }
    if (payload.category != null) {
        formData.append('Category', String(payload.category));
    }
    if (payload.price != null && payload.price.length > 0) {
        appendArray(formData, 'Price', payload.price);
    }
    if (payload.durationMinutes != null && payload.durationMinutes.length > 0) {
        appendArray(formData, 'DurationMinutes', payload.durationMinutes);
    }
    if (payload.addOns != null && payload.addOns.length > 0) {
        appendArray(formData, 'AddOns', payload.addOns);
    }
    if (payload.addOnPrices != null && payload.addOnPrices.length > 0) {
        appendArray(formData, 'AddOnPrices', payload.addOnPrices);
    }
    if (payload.imageFile != null) {
        const file = payload.imageFile as any;
        if (file.uri) {
            // React Native ImagePicker asset: { uri, name, type }
            formData.append('ImageFile', {
                uri: file.uri,
                name: file.name ?? 'service_image.jpg',
                type: file.type ?? 'image/jpeg',
            } as any);
        } else {
            // Web File object
            formData.append('ImageFile', file);
        }
    }
    if (payload.isActive != null) {
        formData.append('IsActive', String(payload.isActive));
    }
    if ('updatedBy' in payload && payload.updatedBy != null) {
        formData.append('UpdatedBy', payload.updatedBy);
    }

    return formData;
}

/**
 * POST /api/SalonService/add-service
 * Creates a new salon service for the authenticated admin.
 * Sends FormData (includes optional image file upload).
 */
export async function addSalonService(
    payload: CreateSalonServiceRequest,
): Promise<ApiResponse<{ id: string }>> {
    console.log('[apiService] addSalonService: building FormData', {
        serviceName: payload.serviceName,
        category: payload.category,
        tiers: payload.price.length,
    });
    const formData = buildServiceFormData(payload);
    const { data } = await axiosClient.post<ApiResponse<{ id: string }>>(
        `${BASE}/add-service`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    console.log('[apiService] addSalonService: response =', JSON.stringify(data));
    return data;
}

/**
 * GET /api/SalonService/get-service
 * Returns a paginated list of salon services filtered by the provided params.
 */
export async function getSalonServices(
    params?: GetSalonServicesParams,
): Promise<ApiResponse<PaginatedResponse<SalonServiceResponse>>> {
    console.log('[apiService] getSalonServices: params =', JSON.stringify(params));
    const { data } = await axiosClient.get<ApiResponse<PaginatedResponse<SalonServiceResponse>>>(
        `${BASE}/get-service`,
        { params },
    );
    console.log('[apiService] getSalonServices: totalCount =', data?.data?.totalCount ?? 0);
    return data;
}

/**
 * PUT /api/SalonService/update-service/:id
 * Updates an existing salon service. Sends FormData.
 */
export async function updateSalonService(
    id: string,
    payload: UpdateSalonServiceRequest,
): Promise<ApiResponse<null>> {
    console.log('[apiService] updateSalonService: id =', id);
    const formData = buildServiceFormData(payload);
    const { data } = await axiosClient.put<ApiResponse<null>>(
        `${BASE}/update-service/${id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    console.log('[apiService] updateSalonService: response =', JSON.stringify(data));
    return data;
}

/**
 * DELETE /api/SalonService/delete-service/:id
 * Permanently deletes a salon service.
 */
export async function deleteSalonService(
    id: string,
): Promise<ApiResponse<null>> {
    console.log('[apiService] deleteSalonService: id =', id);
    const { data } = await axiosClient.delete<ApiResponse<null>>(
        `${BASE}/delete-service/${id}`,
    );
    console.log('[apiService] deleteSalonService: response =', JSON.stringify(data));
    return data;
}
