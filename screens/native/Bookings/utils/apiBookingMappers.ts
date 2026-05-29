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

export const formatApiTime = (
  startValue: string | null | undefined, 
  endValue: string | null | undefined,
  durationMinutes?: number | null
): string => {
  if (!startValue && !endValue) return 'N/A';
  
  const parseValidDate = (value: string | null | undefined): Date | null => {
    if (!value || value.trim() === '') return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    if (parsed.getFullYear() < 2000) return null; // Catch 0001-01-01
    return parsed;
  };

  const startDate = parseValidDate(startValue);
  let endDate = parseValidDate(endValue);

  if (startDate && !endDate && durationMinutes) {
    endDate = new Date(startDate.getTime() + durationMinutes * 60000);
  }

  const formatTime = (date: Date | null, originalValue: string | null | undefined): string | null => {
    if (date) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    if (originalValue && originalValue.trim() !== '') return originalValue;
    return null;
  };
  
  const start = formatTime(startDate, startValue);
  const end = formatTime(endDate, endValue);
  
  if (start && end) return `${start} - ${end}`;
  if (start) return start;
  if (end) return end;
  return 'N/A';
};

export const mapApiBookingToCard = (apiBooking: BookingResponse): Booking => {
  const rawBooking = apiBooking as any;
  const price = apiBooking.totalPrice ?? rawBooking.TotalPrice ?? apiBooking.selectedPrice ?? rawBooking.SelectedPrice ?? null;

  return {
    id: nullableText(apiBooking.bookingId ?? rawBooking.BookingId),
    serviceName: nullableText(apiBooking.salonServiceName ?? rawBooking.SalonServiceName),
    spaName: nullableText(apiBooking.establishmentName ?? rawBooking.EstablishmentName),
    status: mapApiStatus(apiBooking.status ?? rawBooking.Status),
    date: formatApiDate(apiBooking.bookingDate ?? rawBooking.BookingDate),
    time: formatApiTime(
      apiBooking.startTime ?? rawBooking.StartTime,
      apiBooking.endTime ?? rawBooking.EndTime,
      apiBooking.selectedDurationMinutes ?? rawBooking.SelectedDurationMinutes
    ),
    price: price ?? 0,
    priceDisplay: price == null ? 'N/A' : undefined,
  };
};

const getServiceSelectedPrice = (
  apiBooking: BookingResponse,
  salonService?: SalonServiceResponse | null,
): number | null => {
  const rawBooking = apiBooking as any;
  const selPrice = apiBooking.selectedPrice ?? rawBooking.SelectedPrice;
  if (selPrice != null) return selPrice;
  if (!salonService) return null;
  const durationMinutes = apiBooking.selectedDurationMinutes ?? rawBooking.SelectedDurationMinutes;
  const durationIndex = salonService.durationMinutes.findIndex(
    (duration) => duration === durationMinutes,
  );
  return durationIndex >= 0 ? salonService.price[durationIndex] ?? null : salonService.price[0] ?? null;
};

export const mapApiBookingToDetails = (
  apiBooking: BookingResponse,
  salonService?: SalonServiceResponse | null,
): BookingDetails => {
  const rawBooking = apiBooking as any;
  const cardBooking = mapApiBookingToCard(apiBooking);
  const paymentStatus = apiBooking.paymentStatus ?? rawBooking.PaymentStatus ?? '';
  const isFullPayment = paymentStatus.toLowerCase().includes('full');
  const selectedPrice = getServiceSelectedPrice(apiBooking, salonService);
  const selectedAddOns = apiBooking.selectedAddOns ?? rawBooking.SelectedAddOns ?? [];
  const selectedAddOnPrices = apiBooking.selectedAddOnPrices ?? rawBooking.SelectedAddOnPrices ?? [];
  const totalPrice = apiBooking.totalPrice ?? rawBooking.TotalPrice
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
    serviceName: nullableText(salonService?.serviceName ?? apiBooking.salonServiceName ?? rawBooking.SalonServiceName),
    price: selectedPrice ?? cardBooking.price,
    spaImage: fallbackSalonImage,
    spaRating: 0,
    spaDetails: 'N/A',
    address: nullableText(apiBooking.readableAddress ?? apiBooking.establishmentAddress ?? rawBooking.ReadableAddress ?? rawBooking.EstablishmentAddress),
    latitude: apiBooking.latitude ?? rawBooking.Latitude ?? Number.NaN,
    longitude: apiBooking.longitude ?? rawBooking.Longitude ?? Number.NaN,
    therapistName: nullableText(apiBooking.staffName ?? rawBooking.StaffName),
    therapistTitle: 'Certified Massage Therapist',
    bookingId: nullableText(apiBooking.bookingId ?? rawBooking.BookingId),
    establishmentId: apiBooking.establishmentId ?? rawBooking.EstablishmentId ?? salonService?.uid,
    staffId: apiBooking.staffId ?? rawBooking.StaffId,
    customerId: apiBooking.customerId ?? rawBooking.CustomerId,
    paidAmount: paidAmount ?? 0,
    paidAmountDisplay: paidAmount == null ? 'N/A' : undefined,
    paymentStatus,
    salonServiceId: apiBooking.salonServiceId ?? rawBooking.SalonServiceId,
    selectedPrice: selectedPrice ?? undefined,
    selectedAddOns,
    selectedAddOnPrices,
    createdDate: apiBooking.createdDate ?? rawBooking.CreatedDate,
  };
};
