import type { BookingResponse } from '@/api/types';
import { BOOKING_STATUS, type Booking } from '../types/Booking';
import type { BookingDetails } from '../types/BookingDetails';

const fallbackSalonImage = require('../../../../assets/salon.jpg');

export const nullableText = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return 'N/A';
  return String(value);
};

export const mapApiStatus = (status: string | null | undefined): number => {
  switch ((status ?? '').toLowerCase()) {
    case 'confirmed':
      return BOOKING_STATUS.CONFIRMED;
    case 'completed':
      return BOOKING_STATUS.COMPLETED;
    case 'cancelled':
    case 'canceled':
    case 'noshow':
    case 'no show':
      return BOOKING_STATUS.CANCELLED;
    case 'pending':
    default:
      return BOOKING_STATUS.PENDING;
  }
};

export const formatApiDate = (dateValue: string | null | undefined): string => {
  if (!dateValue) return 'N/A';
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return nullableText(dateValue);
  return parsed.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
};

export const formatApiTime = (startValue: string | null | undefined, endValue: string | null | undefined): string => {
  if (!startValue && !endValue) return 'N/A';
  const formatTime = (value: string | null | undefined): string => {
    if (!value) return 'N/A';
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return value;
  };
  return `${formatTime(startValue)} - ${formatTime(endValue)}`;
};

export const mapApiBookingToCard = (apiBooking: BookingResponse): Booking => {
  const price = apiBooking.totalPrice ?? apiBooking.selectedPrice ?? null;

  return {
    id: nullableText(apiBooking.bookingId),
    serviceName: nullableText(apiBooking.salonServiceName),
    spaName: nullableText(apiBooking.establishmentName),
    status: mapApiStatus(apiBooking.status),
    date: formatApiDate(apiBooking.bookingDate),
    time: formatApiTime(apiBooking.startTime, apiBooking.endTime),
    price: price ?? 0,
    priceDisplay: price == null ? 'N/A' : undefined,
  };
};

export const mapApiBookingToDetails = (apiBooking: BookingResponse): BookingDetails => {
  const cardBooking = mapApiBookingToCard(apiBooking);
  const paidAmount = apiBooking.totalPrice == null ? null : apiBooking.totalPrice / 2;

  return {
    ...cardBooking,
    spaImage: fallbackSalonImage,
    spaRating: 0,
    spaDetails: 'N/A',
    address: nullableText(apiBooking.readableAddress ?? apiBooking.establishmentAddress),
    latitude: apiBooking.latitude ?? Number.NaN,
    longitude: apiBooking.longitude ?? Number.NaN,
    therapistName: nullableText(apiBooking.staffName),
    therapistTitle: 'Certified Massage Therapist',
    bookingId: nullableText(apiBooking.bookingId),
    paidAmount: paidAmount ?? 0,
    paidAmountDisplay: paidAmount == null ? 'N/A' : undefined,
  };
};
