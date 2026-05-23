import type { BookingResponse, SalonServiceResponse } from '@/api/types';
import { BOOKING_STATUS, type Booking } from '../types/Booking';
import type { BookingDetails } from '../types/BookingDetails';

const fallbackSalonImage = require('../../../../assets/salon.jpg');

export const nullableText = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return 'N/A';
  return String(value);
};

export const mapApiStatus = (status: number | string | null | undefined): number => {
  if (typeof status === 'number') {
    switch (status) {
      case 1:
        return BOOKING_STATUS.CONFIRMED;
      case 2:
        return BOOKING_STATUS.ONGOING;
      case 3:
        return BOOKING_STATUS.COMPLETED;
      case 4:
        return BOOKING_STATUS.CANCELLED;
      case 0:
      default:
        return BOOKING_STATUS.PENDING;
    }
  }

  switch ((status ?? '').toLowerCase()) {
    case 'confirmed':
      return BOOKING_STATUS.CONFIRMED;
    case 'ongoing':
    case 'in progress':
      return BOOKING_STATUS.ONGOING;
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

const getServiceSelectedPrice = (
  apiBooking: BookingResponse,
  salonService?: SalonServiceResponse | null,
): number | null => {
  if (apiBooking.selectedPrice != null) return apiBooking.selectedPrice;
  if (!salonService) return null;
  const durationIndex = salonService.durationMinutes.findIndex(
    (duration) => duration === apiBooking.selectedDurationMinutes,
  );
  return durationIndex >= 0 ? salonService.price[durationIndex] ?? null : salonService.price[0] ?? null;
};

export const mapApiBookingToDetails = (
  apiBooking: BookingResponse,
  salonService?: SalonServiceResponse | null,
): BookingDetails => {
  const cardBooking = mapApiBookingToCard(apiBooking);
  const paymentStatus = apiBooking.paymentStatus ?? '';
  const isFullPayment = paymentStatus.toLowerCase().includes('full');
  const selectedPrice = getServiceSelectedPrice(apiBooking, salonService);
  const selectedAddOns = apiBooking.selectedAddOns ?? [];
  const selectedAddOnPrices = apiBooking.selectedAddOnPrices ?? [];
  const totalPrice = apiBooking.totalPrice
    ?? (selectedPrice == null
      ? null
      : selectedPrice + selectedAddOnPrices.reduce((sum, price) => sum + price, 0));
  const paidAmount = totalPrice == null
    ? null
    : isFullPayment
      ? totalPrice
      : totalPrice / 2;

  return {
    ...cardBooking,
    serviceName: nullableText(salonService?.serviceName ?? apiBooking.salonServiceName),
    price: selectedPrice ?? cardBooking.price,
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
    paymentStatus,
    salonServiceId: apiBooking.salonServiceId,
    selectedPrice: selectedPrice ?? undefined,
    selectedAddOns,
    selectedAddOnPrices,
  };
};
