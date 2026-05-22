// Booking status constants
// 0 = confirmed, 1 = pending, 2 = completed, 3 = cancelled
export const BOOKING_STATUS = {
  CONFIRMED: 0,
  PENDING: 1,
  COMPLETED: 2,
  CANCELLED: 3,
} as const;

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

export interface Booking {
  id: string;
  serviceName: string;
  spaName: string;
  customerName?: string;
  customerImage?: any;
  status: number; // 0 = confirmed, 1 = pending, 2 = completed, 3 = cancelled
  date: string;
  time: string;
  price: number;
  priceDisplay?: string;
}

// Convert status number to display text
export function getStatusText(status: number): string {
  switch (status) {
    case BOOKING_STATUS.CONFIRMED:
      return 'Confirmed';
    case BOOKING_STATUS.PENDING:
      return 'Pending';
    case BOOKING_STATUS.COMPLETED:
      return 'Completed';
    case BOOKING_STATUS.CANCELLED:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
}
