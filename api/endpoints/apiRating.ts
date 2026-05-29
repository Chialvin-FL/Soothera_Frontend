import axiosClient from '../axiosClient';
import type {
  CreateRatingRequest,
  TargetRatingsResponse,
} from '../types';

// ─────────────────────────────────────────────────────────────
// Rating Endpoints
// Base route: /api/Rating
// ─────────────────────────────────────────────────────────────

const BASE = '/Rating';

/**
 * POST /api/Rating/create-rating
 * Creates a new rating for a booking.
 */
export async function createRating(
  payload: CreateRatingRequest,
): Promise<TargetRatingsResponse> {
  console.log('[apiRating] createRating: sending POST to', `${BASE}/create-rating`);
  const { data } = await axiosClient.post<TargetRatingsResponse>(
    `${BASE}/create-rating`,
    payload,
  );
  console.log('[apiRating] createRating: response =', JSON.stringify(data));
  return data;
}

/**
 * GET /api/Rating/establishment/{establishmentId}
 * Gets ratings for a specific establishment (Salon).
 */
export async function getEstablishmentRatings(
  establishmentId: string,
): Promise<TargetRatingsResponse> {
  console.log('[apiRating] getEstablishmentRatings: sending GET for establishmentId =', establishmentId);
  const { data } = await axiosClient.get<TargetRatingsResponse>(
    `${BASE}/establishment/${establishmentId}`,
  );
  return data;
}

/**
 * GET /api/Rating/staff/{staffId}
 * Gets ratings for a specific staff member (Therapist).
 */
export async function getStaffRatings(
  staffId: string,
): Promise<TargetRatingsResponse> {
  console.log('[apiRating] getStaffRatings: sending GET for staffId =', staffId);
  const { data } = await axiosClient.get<TargetRatingsResponse>(
    `${BASE}/staff/${staffId}`,
  );
  return data;
}

/**
 * GET /api/Rating/customer/{customerId}
 * Gets ratings for a specific customer.
 */
export async function getCustomerRatings(
  customerId: string,
): Promise<TargetRatingsResponse> {
  console.log('[apiRating] getCustomerRatings: sending GET for customerId =', customerId);
  const { data } = await axiosClient.get<TargetRatingsResponse>(
    `${BASE}/customer/${customerId}`,
  );
  return data;
}
