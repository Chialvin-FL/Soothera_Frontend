// Booking status constants
// 0 = pending, 1 = confirmed, 2 = ongoing, 3 = completed, 4 = cancelled
export const BOOKING_STATUS = {
  PENDING: 0,
  CONFIRMED: 1,
  ONGOING: 2,
  COMPLETED: 3,
  CANCELLED: 4,
} as const;

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

export interface Booking {
  id: string;
  serviceName: string;
  spaName: string;
  customerName?: string;
  customerImage?: any;
  spaImage?: any;
  status: number; // 0 = pending, 1 = confirmed, 2 = ongoing, 3 = completed, 4 = cancelled
  date: string;
  time: string;
  price: number;
  priceDisplay?: string;
}

// Convert status number to display text
export function getStatusText(status: number): string {
  switch (status) {
    case BOOKING_STATUS.PENDING:
      return 'Pending';
    case BOOKING_STATUS.CONFIRMED:
      return 'Confirmed';
    case BOOKING_STATUS.ONGOING:
      return 'Ongoing';
    case BOOKING_STATUS.COMPLETED:
      return 'Completed';
    case BOOKING_STATUS.CANCELLED:
      return 'Cancelled';
    default:
      return 'Unknown';
  }
}
