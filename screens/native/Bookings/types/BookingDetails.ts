import { Booking } from './Booking';

export interface BookingDetails extends Booking {
  // Spa information
  spaImage: any; // Image source (require() or URI)
  spaRating: number; // Float rating (e.g., 4.5)
  spaDetails: string; // Description/details about the spa
  address: string;
  // Location coordinates for map
  latitude: number;
  longitude: number;
  
  // Therapist information
  therapistName: string;
  therapistTitle: string; // e.g., "Certified Massage Therapist"
  
  // Payment information
  bookingId: string;
  paidAmount: number; // Paid amount for the booking document
  paidAmountDisplay?: string;
  paymentStatus?: string;
  salonServiceId?: string;
  selectedPrice?: number;
  selectedAddOns?: string[];
  selectedAddOnPrices?: number[];
}
