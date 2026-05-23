import { API_CONFIG } from '@/api/config';
import type { SalonEstablishment } from '@/api/types';
import type { TopRatedSalon } from '../types/Home';
import type { Review, SalonDetails, Therapist } from '../types/SalonDetails';

const FALLBACK_IMAGE = require('../../../../assets/spas/grand.png');
const NOT_AVAILABLE = 'N/A';

type ApiSalonEstablishment = Partial<SalonEstablishment> & Record<string, unknown>;

function pick<T = unknown>(source: Record<string, unknown>, ...keys: string[]): T | undefined {
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null) {
      return value as T;
    }
  }
  return undefined;
}

function textOrNA(value: unknown): string {
  return typeof value === 'string' && value.trim() ? value.trim() : NOT_AVAILABLE;
}

function optionalText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function numberOrZero(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return 0;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        return textOrNA(pick(obj, 'serviceName', 'ServiceName', 'name', 'Name'));
      }
      return '';
    })
    .filter((item) => item && item !== NOT_AVAILABLE);
}

function imageSource(value: unknown) {
  const uri = optionalText(value);
  if (!uri || uri === 'null') return FALLBACK_IMAGE;
  if (/^https?:\/\//i.test(uri)) return { uri };
  return { uri: `${API_CONFIG.BASE_URL}${uri.startsWith('/') ? '' : '/'}${uri}` };
}

function therapists(value: unknown): Therapist[] {
  if (!Array.isArray(value)) return [];

  return value.map((item, index) => {
    const obj = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
    return {
      id: optionalText(pick(obj, 'id', 'Id', 'uid', 'UID')) ?? `${index}`,
      name: textOrNA(pick(obj, 'name', 'Name', 'fullName', 'FullName', 'staffName', 'StaffName')),
      title: textOrNA(pick(obj, 'title', 'Title', 'role', 'Role')),
      image: imageSource(pick(obj, 'image', 'Image', 'profilePicture', 'ProfilePicture')),
      rating: numberOrZero(pick(obj, 'rating', 'Rating')),
    };
  });
}

function reviews(value: unknown): Review[] {
  if (!Array.isArray(value)) return [];

  return value.map((item) => {
    const obj = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
    return {
      userName: textOrNA(pick(obj, 'userName', 'UserName', 'name', 'Name')),
      rating: numberOrZero(pick(obj, 'rating', 'Rating')),
      comment: textOrNA(pick(obj, 'comment', 'Comment', 'description', 'Description')),
      date: optionalText(pick(obj, 'date', 'Date', 'createdAt', 'CreatedAt')),
    };
  });
}

export function toTopRatedSalon(establishment: SalonEstablishment | ApiSalonEstablishment): TopRatedSalon {
  const est = establishment as ApiSalonEstablishment;
  const address = pick(est, 'address', 'Address', 'location', 'Location');

  return {
    id: textOrNA(pick(est, 'id', 'Id')),
    name: textOrNA(pick(est, 'name', 'Name')),
    rating: numberOrZero(pick(est, 'rating', 'Rating')),
    location: textOrNA(address),
    image: imageSource(pick(est, 'salonPicture', 'SalonPicture', 'image', 'Image')),
    services: stringArray(pick(est, 'services', 'Services')),
    description: optionalText(pick(est, 'description', 'Description')),
    contactNumber: optionalText(pick(est, 'contactNumber', 'ContactNumber')),
    businessHours: optionalText(pick(est, 'businessHours', 'BusinessHours')),
    socials: stringArray(pick(est, 'socials', 'Socials')),
    latitude: numberOrZero(pick(est, 'latitude', 'Latitude')),
    longitude: numberOrZero(pick(est, 'longitude', 'Longitude')),
  };
}

export function toSalonDetails(establishment: SalonEstablishment | ApiSalonEstablishment): SalonDetails {
  const est = establishment as ApiSalonEstablishment;
  const address = pick(est, 'address', 'Address', 'location', 'Location');
  const socials = stringArray(pick(est, 'socials', 'Socials'));
  const mappedReviews = reviews(pick(est, 'reviews', 'Reviews'));

  return {
    ...toTopRatedSalon(est),
    description: textOrNA(pick(est, 'description', 'Description')),
    address: textOrNA(address),
    latitude: numberOrZero(pick(est, 'latitude', 'Latitude')),
    longitude: numberOrZero(pick(est, 'longitude', 'Longitude')),
    operatingHours: textOrNA(pick(est, 'businessHours', 'BusinessHours', 'operatingHours', 'OperatingHours')),
    distance: textOrNA(pick(est, 'distance', 'Distance')),
    reviewCount: numberOrZero(pick(est, 'reviewCount', 'ReviewCount')) || mappedReviews.length,
    therapists: therapists(pick(est, 'therapists', 'Therapists')),
    reviews: mappedReviews,
    phoneNumber: optionalText(pick(est, 'contactNumber', 'ContactNumber', 'phoneNumber', 'PhoneNumber')),
    facebookUrl: optionalText(pick(est, 'facebookUrl', 'FacebookUrl')) ?? socials[0],
  };
}

export function topRatedSalonToDetails(salon: TopRatedSalon): SalonDetails {
  return {
    ...salon,
    name: textOrNA(salon.name),
    location: textOrNA(salon.location),
    services: salon.services ?? [],
    description: textOrNA(salon.description),
    address: textOrNA(salon.location),
    latitude: 0,
    longitude: 0,
    operatingHours: textOrNA(salon.businessHours),
    distance: NOT_AVAILABLE,
    reviewCount: 0,
    therapists: [],
    reviews: [],
    phoneNumber: optionalText(salon.contactNumber),
    facebookUrl: salon.socials?.[0],
  };
}
